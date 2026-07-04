var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (the Skylark Cloud MSA negotiation on
 *   matter M-2431 "Kestrel Labs — Atlas Launch Vendor Agreements": 5 turns
 *   v1–v5 alternating Marlow & Voss LLP and Skylark Cloud with fixed July
 *   2026 dates; 8 changed clauses authored as attributed segment runs
 *   (base / counterparty-inserted / counterparty-deleted / firm-inserted /
 *   firm-deleted / inserted-then-struck) so every pane state renders from
 *   one fixture; 2 privileged firm-internal annotations; a Casewright turn
 *   summary; and 5 tracked negotiation positions)
 * @output Negotiation diff & turn-history surface for a contract under
 *   active markup: header with privilege strip, base/compare version
 *   Selectors (v4 Skylark turn vs v5 M&V working draft) and a
 *   changed-clause meter; a 5-turn history band alternating firm and
 *   counterparty avatars with dates and turn-summary chips; a
 *   changed-clause navigator rail (8 entries color-coded by who changed);
 *   clause-aligned side-by-side serif paper panes with tracked changes —
 *   counterparty edits in orange, firm edits in blue, insertions
 *   underlined, deletions struck; a Casewright AI turn-summary Card
 *   ("accepted 3 of 5 positions; new carve-out in § 9.2") whose citation
 *   chips jump into the diff; 2 per-change firm-internal annotations
 *   marked privileged; and a position-tracker footer (5 points with
 *   ours / theirs / agreed states). Send-markup is confirm-gated.
 * @position Page template; emitted by \`astryx template contract-diff-negotiation\`
 *
 * Frame: root div 100dvh wrapping Layout height="fill". LayoutHeader
 * stacks the privilege strip over the identity/selector toolbar; a
 * non-scrolling turn-history band sits at the top of the content column;
 * LayoutPanel start 280 hosts the changed-clause navigator; LayoutContent
 * (padding 0) is a muted backdrop scroller holding the Casewright turn
 * summary, a sticky pane-version bar, and the clause-aligned two-column
 * paper grid; LayoutFooter carries the position tracker. The paper cells
 * are STATIC styled previews — no caret, no editing chrome; the live
 * word processor lives elsewhere.
 *
 * Responsive contract:
 * - >1024px: rail 280 (scrolls) | turn band + content scroller | footer.
 * - <=1024px: the rail leaves the frame; the navigator renders as a
 *   wrapping chip band above the turn-summary card inside the scroller.
 * - <=768px: the clause grid drops to ONE column — each paper cell gains
 *   its own version mini-caption so panes never interleave ambiguously;
 *   the turn band scrolls horizontally.
 * - <=640px: the header drops the matter meta line, the meter collapses
 *   to the single total chip, and footer position chips wrap; header and
 *   toolbar rows are wrap="wrap" so nothing clips at 375px.
 *
 * Container policy (negotiation-diff archetype): frame-first rows and
 * panels. Navigator rows and turn cards are dense button rows, not Cards;
 * privileged annotations are framed chrome rows. The ONLY Card is the
 * Casewright turn-summary — a genuine AI summary widget per the Legal AI
 * suite policy.
 *
 * Color policy: ONE app accent (--color-accent) for selection rings and
 * primary actions. Change ATTRIBUTION is a documented palette, not extra
 * accents: counterparty = categorical orange, firm = categorical blue,
 * both = categorical purple, agreed = categorical green — all chrome uses
 * the token + light-dark() fallback pairs. The paper cells are
 * scheme-locked light (colorScheme:'light') so redlines read as printed
 * tracked changes in both schemes; PAPER_* / CP_*_PAPER / FIRM_*_PAPER
 * literals stay raw hex on that locked surface only. The privilege strip
 * and privileged-annotation chrome use an amber light-dark() pair.
 * Document content on paper is serif (Georgia stack) per the suite's
 * document-voice rule; ALL chrome stays on token typography.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

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
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Selector} from '@astryxdesign/core/Selector';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  FileTextIcon,
  FlagIcon,
  LockIcon,
  SendIcon,
  SparklesIcon,
} from 'lucide-react';

// ============= PAINT CONSTANTS =============
// Paper: scheme-locked light surface (see Color policy). Literals only.

const PAPER_BG = '#FFFFFF';
const PAPER_TEXT = '#1F2A37';
const PAPER_MUTED = '#6B7280';
const PAPER_RULE = '#E5E7EB';
const SERIF = "Georgia, 'Times New Roman', Times, serif";

// Counterparty (Skylark Cloud) redline inks — orange family. *_PAPER paints
// only on the locked paper; *_CHROME pairs also color app chrome.
const CP_INK_PAPER = '#9A3412';
const CP_WASH_PAPER = '#FFEDD5';
const CP_CHROME = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const CP_WASH_CHROME = 'light-dark(rgba(235,110,0,0.14), rgba(255,147,48,0.20))';

// Firm (Marlow & Voss) redline inks — blue family.
const FIRM_INK_PAPER = '#1D4ED8';
const FIRM_WASH_PAPER = '#DBEAFE';
const FIRM_CHROME = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const FIRM_WASH_CHROME = 'light-dark(rgba(1,113,227,0.12), rgba(76,158,255,0.18))';

// Both-sides + agreed chrome accents (attribution palette, chrome only).
const BOTH_CHROME = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const BOTH_WASH_CHROME = 'light-dark(rgba(107,30,253,0.10), rgba(157,107,255,0.16))';
const AGREED_CHROME = 'var(--color-data-categorical-green,  light-dark(#0B991F, #34C759))';

// Privilege chrome — amber pair shared by the strip and annotations.
const PRIV_INK = 'light-dark(#92400E, #E0A64B)';
const PRIV_WASH = 'light-dark(rgba(180,83,9,0.10), rgba(224,166,75,0.14))';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  fill: {height: '100%', minHeight: 0},
  // Privilege strip: pinned above the toolbar inside the header.
  privilegeStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-4)',
    backgroundColor: PRIV_WASH,
    color: PRIV_INK,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  headerToolbar: {
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  // Changed-clause meter chips (header). Counts reconcile with the rail.
  meterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 'var(--radius-container)',
    padding: '2px 8px',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  meterTotal: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  meterTheirs: {backgroundColor: CP_WASH_CHROME, color: CP_CHROME},
  meterOurs: {backgroundColor: FIRM_WASH_CHROME, color: FIRM_CHROME},
  meterBoth: {backgroundColor: BOTH_WASH_CHROME, color: BOTH_CHROME},
  // Turn-history band: one horizontal row under the header; scrolls
  // horizontally when narrow. No mask fades (footgun 11) — plain overflow.
  turnBand: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    flexShrink: 0,
    overflowX: 'auto',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  // Turn cards: dense button rows (Container policy), never Cards.
  turnCard: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-2)',
    minWidth: 208,
    maxWidth: 280,
    flex: '1 0 208px',
    padding: 'var(--spacing-2)',
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    borderRadius: 'var(--radius-container)',
  },
  turnCardClickable: {cursor: 'pointer'},
  turnCardActive: {
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  // Side marker: 3px attribution bar (firm blue / counterparty orange).
  turnMarker: {width: 3, borderRadius: 2, flexShrink: 0},
  turnBody: {minWidth: 0, flex: 1},
  turnSummary: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  chipNoShrink: {flexShrink: 0, whiteSpace: 'nowrap'},
  // Navigator rail (280px): only this list scrolls.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
    display: 'inline-block',
  },
  railRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    width: '100%',
    padding: 'var(--spacing-2)',
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    borderRadius: 'var(--radius-container)',
  },
  railRowActive: {
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  railNum: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    paddingTop: 2,
  },
  // <=1024px fallback: navigator as a wrapping chip band in the scroller.
  navChipBand: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
  },
  // Content scroller: muted backdrop; generous bottom padding keeps the
  // last clause clear of the footer (footgun 16 discipline).
  contentScroll: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding:
      'var(--spacing-4) var(--spacing-4) calc(var(--spacing-6) + 48px)',
    display: 'flex',
    flexDirection: 'column',
  },
  contentColumn: {width: '100%', maxWidth: 1200, marginInline: 'auto'},
  // Sticky pane-version bar: sticks to the scrollport top, chrome-side.
  paneBar: {
    position: 'sticky',
    top: 'calc(-1 * var(--spacing-4))',
    zIndex: 2,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4) 0 var(--spacing-2)',
    // --color-background-muted is translucent; layer it over the surface so
    // scrolled clause chrome cannot bleed through the stuck bar.
    backgroundColor: 'var(--color-background-surface)',
    backgroundImage:
      'linear-gradient(var(--color-background-muted), var(--color-background-muted))',
  },
  paneBarStacked: {gridTemplateColumns: '1fr'},
  paneLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minWidth: 0,
    padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  attribDot: {width: 8, height: 8, borderRadius: 4, flexShrink: 0},
  // Clause blocks: chrome row above a clause-aligned two-column paper grid.
  clauseBlock: {
    marginTop: 'var(--spacing-4)',
    scrollMarginTop: 72,
  },
  clauseChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: '0 var(--spacing-1) var(--spacing-1)',
  },
  clauseSelected: {
    borderRadius: 'var(--radius-container)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    padding: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-surface)',
  },
  clauseGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-2)',
    alignItems: 'stretch',
  },
  clauseGridStacked: {gridTemplateColumns: '1fr'},
  // Paper cells: scheme-locked light document surfaces (see Color policy).
  paperCell: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-low, 0 1px 2px rgba(15,23,42,0.10))',
    padding: 'var(--spacing-4) var(--spacing-5)',
    minWidth: 0,
  },
  paperCaption: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: PAPER_MUTED,
    marginBottom: 8,
    fontFamily: 'inherit',
  },
  clauseHeading: {
    fontFamily: SERIF,
    fontSize: 15,
    fontWeight: 700,
    margin: '0 0 8px',
    color: PAPER_TEXT,
  },
  clauseText: {
    fontFamily: SERIF,
    fontSize: 15,
    lineHeight: 1.75,
    margin: 0,
    overflowWrap: 'break-word',
  },
  paperEmpty: {
    fontFamily: SERIF,
    fontSize: 14,
    fontStyle: 'italic',
    color: PAPER_MUTED,
    margin: 0,
  },
  // Tracked-change spans: insertions underlined, deletions struck, ink by
  // author (counterparty orange, firm blue) — the legal redline idiom.
  cpIns: {
    backgroundColor: CP_WASH_PAPER,
    color: CP_INK_PAPER,
    borderRadius: 3,
    paddingInline: 1,
    textDecoration: 'underline',
    textDecorationThickness: 1.5,
    textUnderlineOffset: 3,
    textDecorationColor: CP_INK_PAPER,
  },
  cpDel: {
    backgroundColor: CP_WASH_PAPER,
    color: CP_INK_PAPER,
    borderRadius: 3,
    paddingInline: 1,
    textDecoration: 'line-through',
    textDecorationThickness: 1.5,
    textDecorationColor: CP_INK_PAPER,
  },
  firmIns: {
    backgroundColor: FIRM_WASH_PAPER,
    color: FIRM_INK_PAPER,
    borderRadius: 3,
    paddingInline: 1,
    textDecoration: 'underline',
    textDecorationThickness: 1.5,
    textUnderlineOffset: 3,
    textDecorationColor: FIRM_INK_PAPER,
  },
  firmDel: {
    backgroundColor: FIRM_WASH_PAPER,
    color: FIRM_INK_PAPER,
    borderRadius: 3,
    paddingInline: 1,
    textDecoration: 'line-through',
    textDecorationThickness: 1.5,
    textDecorationColor: FIRM_INK_PAPER,
  },
  // Privileged firm-internal annotation: framed chrome row, not a Card.
  annotation: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    marginTop: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: \`var(--border-width) solid \${PRIV_WASH}\`,
    backgroundColor: PRIV_WASH,
  },
  annotationBody: {minWidth: 0, flex: 1},
  // Casewright turn-summary Card region.
  summaryWrap: {marginBottom: 'var(--spacing-2)'},
  citationRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
    alignItems: 'center',
  },
  disclosureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    minWidth: 0,
  },
  // Position-tracker footer.
  footerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-4)',
  },
  positionChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    border: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    borderRadius: 999,
    whiteSpace: 'nowrap',
  },
  positionDot: {width: 8, height: 8, borderRadius: 4, flexShrink: 0},
};

// ============= WORLD FIXTURES =============
// Casewright at Marlow & Voss LLP, matter M-2431 (Kestrel Labs — Atlas
// Launch Vendor Agreements). Roster names/roles are canonical across the
// Legal AI suite — never rename or re-role. Suite "now": Wed Jul 15, 2026.

const DOC_TITLE = 'Skylark Cloud — Master Services Agreement';
const MATTER_LINE =
  'M-2431 · Kestrel Labs — Atlas Launch Vendor Agreements · execution target Fri Jul 24, 2026';
const DISCLOSURE = 'AI-generated · verify before relying';

type Side = 'firm' | 'cp';

interface Person {
  id: string;
  name: string;
  role: string;
  side: Side;
}

const PEOPLE: Record<string, Person> = {
  chen: {id: 'chen', name: 'David Chen', role: 'Associate · Marlow & Voss', side: 'firm'},
  voss: {id: 'voss', name: 'Julian Voss', role: 'Partner · Marlow & Voss', side: 'firm'},
  vega: {id: 'vega', name: 'Ruth Vega', role: 'Knowledge lawyer · Marlow & Voss', side: 'firm'},
  reyes: {id: 'reyes', name: 'Marta Reyes', role: 'Commercial counsel · Skylark Cloud', side: 'cp'},
};

// ---- Turn history (5 turns, alternating paper) ----

interface Turn {
  version: 'v1' | 'v2' | 'v3' | 'v4' | 'v5';
  side: Side;
  actorId: string;
  org: string;
  date: string;
  summary: string;
  chip: string;
}

// prettier-ignore
const TURNS: Turn[] = [
  {version: 'v1', side: 'firm', actorId: 'chen', org: 'Marlow & Voss', date: 'Mon Jun 15',
    summary: 'First draft off the M&V cloud-services form', chip: 'Our paper'},
  {version: 'v2', side: 'cp', actorId: 'reyes', org: 'Skylark Cloud', date: 'Tue Jun 23',
    summary: 'Struck the liability cap; narrowed SLA credits; limited audit rights', chip: '17 changes'},
  {version: 'v3', side: 'firm', actorId: 'chen', org: 'Marlow & Voss', date: 'Thu Jul 2',
    summary: 'Cap restored at 12 months’ fees; credits tightened; US-only hosting', chip: '12 changes'},
  {version: 'v4', side: 'cp', actorId: 'reyes', org: 'Skylark Cloud', date: 'Sat Jul 11',
    summary: '3 positions accepted; new § 9.2 carve-out; § 11.3 broadened', chip: '6 clauses'},
  {version: 'v5', side: 'firm', actorId: 'chen', org: 'Marlow & Voss', date: 'Wed Jul 15',
    summary: 'Working markup — strikes the carve-out, restores US/Canada hosting', chip: '4 clauses · draft'},
];

// ---- Pane version selectors ----

type BaseVersion = 'v3' | 'v4';
type CompareVersion = 'v4' | 'v5';

// prettier-ignore
const BASE_OPTIONS = [
  {value: 'v4', label: 'v4 · Skylark turn · Jul 11'}, {value: 'v3', label: 'v3 · our prior turn (clean)'},
];
// prettier-ignore
const COMPARE_OPTIONS = [
  {value: 'v5', label: 'v5 · M&V working draft'}, {value: 'v4', label: 'v4 · as received (clean)'},
];

// ============= CLAUSE DIFF FIXTURES =============
// One attributed segment stream per clause; every pane state (v3 clean,
// v4 tracked, v4 clean, v5 tracked) renders from it deterministically.

type SegKind =
  | 'base' //          unchanged v3 → v5
  | 'cpIns' //         inserted by Skylark in v4
  | 'cpDel' //         deleted by Skylark in v4 (present in v3)
  | 'firmIns' //       inserted by M&V in v5
  | 'firmDel' //       present through v4, struck by M&V in v5
  | 'cpInsFirmDel'; // inserted by Skylark in v4, struck by M&V in v5

interface Seg {
  k: SegKind;
  text: string;
}

type Who = 'theirs' | 'ours' | 'both';

interface Annotation {
  authorId: string;
  when: string;
  text: string;
}

interface Clause {
  id: string;
  num: string;
  title: string;
  who: Who;
  materiality: 'High' | 'Medium' | 'Low';
  note: string;
  reviewFlag?: string;
  annotation?: Annotation;
  segs: Seg[];
}

const sBase = (text: string): Seg => ({k: 'base', text});
const sCpIns = (text: string): Seg => ({k: 'cpIns', text});
const sCpDel = (text: string): Seg => ({k: 'cpDel', text});
const sFirmIns = (text: string): Seg => ({k: 'firmIns', text});
const sFirmDel = (text: string): Seg => ({k: 'firmDel', text});
const sCpInsFirmDel = (text: string): Seg => ({k: 'cpInsFirmDel', text});

const CLAUSES: Clause[] = [
  {
    id: 'c2-1',
    num: '§ 2.1',
    title: 'Term; Renewal',
    who: 'theirs',
    materiality: 'Low',
    note: '24-month initial term accepted; renewal notice 60 → 90 days',
    segs: [
      sBase(
        'This Agreement commences on the Effective Date and continues for an initial term of twenty-four (24) months (the “Initial Term”). Thereafter this Agreement renews for successive twelve (12) month renewal terms unless either party gives written notice of non-renewal at least ',
      ),
      sCpDel('sixty (60)'),
      sCpIns('ninety (90)'),
      sBase(' days before the end of the then-current term.'),
    ],
  },
  {
    id: 'c4-1',
    num: '§ 4.1',
    title: 'Service Levels; Service Credits',
    who: 'theirs',
    materiality: 'Medium',
    note: 'Credit schedule accepted; claim window widened to 30 days; auto-apply added',
    segs: [
      sBase(
        'Skylark Cloud will make the Hosted Services available at least 99.95% of each calendar month, measured as set out in Exhibit B. Where availability falls below the threshold, Kestrel is entitled to the service credits in Exhibit B, ',
      ),
      sCpDel('claimed within fifteen (15) days'),
      sCpIns('provided Kestrel requests the credit within thirty (30) days'),
      sBase(' of the end of the affected month.'),
      sCpIns(
        ' Credits so requested will be applied automatically against the next invoice.',
      ),
    ],
  },
  {
    id: 'c6-2',
    num: '§ 6.2',
    title: 'Fees; Annual Adjustment',
    who: 'ours',
    materiality: 'Medium',
    note: 'Our v5 caps the annual increase at the lesser of CPI or 4%',
    segs: [
      sBase('Fees for each renewal term may increase by no more than '),
      sFirmDel(
        'the percentage increase in the Consumer Price Index over the prior twelve (12) months',
      ),
      sFirmIns(
        'the lesser of the percentage increase in the Consumer Price Index over the prior twelve (12) months or four percent (4%)',
      ),
      sBase(
        ', provided Skylark Cloud gives Kestrel written notice of the adjusted Fees at least ninety (90) days before the start of the renewal term.',
      ),
    ],
  },
  {
    id: 'c7-2',
    num: '§ 7.2',
    title: 'Security; Audit Rights',
    who: 'theirs',
    materiality: 'Medium',
    note: 'Audits limited to 1× per year on 30 days’ notice; SOC 2 report in lieu',
    segs: [
      sBase(
        'Skylark Cloud will maintain the administrative, physical, and technical safeguards described in Exhibit C. Upon reasonable notice, Kestrel may audit Skylark Cloud’s compliance with this Section ',
      ),
      sCpIns(
        'no more than once in any twelve (12) month period, on at least thirty (30) days’ written notice, during normal business hours, and without unreasonable disruption to Skylark Cloud’s operations',
      ),
      sBase('. '),
      sCpIns(
        'Skylark Cloud may provide its most recent SOC 2 Type II report in lieu of an on-site audit where the report reasonably addresses the scope of the requested audit.',
      ),
    ],
  },
  {
    id: 'c9-2',
    num: '§ 9.2',
    title: 'Limitation of Liability',
    who: 'both',
    materiality: 'High',
    note: 'New carve-out for “Customer Configuration Events” — struck in our v5',
    reviewFlag: 'Flagged in Casewright contract review · Jul 14',
    annotation: {
      authorId: 'voss',
      when: 'Jul 15, 8:42 AM',
      text: 'Do not accept the configuration carve-out — it swallows the cap for exactly the incidents Kestrel cares about. Fallback if pressed: carve-out limited to Kestrel’s gross negligence, per playbook LL-4.',
    },
    segs: [
      sBase(
        'Except for the Excluded Claims, neither party’s aggregate liability arising out of or relating to this Agreement will exceed the fees paid or payable by Kestrel in the twelve (12) months preceding the event giving rise to the claim.',
      ),
      sCpInsFirmDel(
        ' Notwithstanding the foregoing, Skylark Cloud will have no liability for any incident affecting Customer Data to the extent caused by configurations, scripts, or access controls implemented by or on behalf of Kestrel (a “Customer Configuration Event”).',
      ),
      sFirmIns(
        ' The cap in this Section 9.2 applies to Skylark Cloud and Kestrel equally, and nothing in this Section limits Skylark Cloud’s obligations under Section 11 (Data Protection).',
      ),
    ],
  },
  {
    id: 'c11-3',
    num: '§ 11.3',
    title: 'Data Location',
    who: 'both',
    materiality: 'High',
    note: '“Any Skylark Cloud region” struck; US/Canada + 60-day notice in our v5',
    annotation: {
      authorId: 'chen',
      when: 'Jul 14, 4:18 PM',
      text: 'Elena Voss confirmed Kestrel’s SOC 2 report promises US/Canada processing — “any region” is a nonstarter for the Atlas launch. OK to concede the 60-day region-change notice mechanism.',
    },
    segs: [
      sBase(
        'Skylark Cloud will host and process Customer Data only in data-center regions located in ',
      ),
      sCpDel('the United States'),
      sCpInsFirmDel(
        'any Skylark Cloud region, provided Skylark Cloud remains subject to the safeguards in Exhibit C',
      ),
      sFirmIns(
        'the United States or Canada, and will give Kestrel at least sixty (60) days’ written notice before any change of hosting region',
      ),
      sBase(
        '. Skylark Cloud will not transfer Customer Data outside the permitted regions without Kestrel’s prior written consent.',
      ),
    ],
  },
  {
    id: 'c13-4',
    num: '§ 13.4',
    title: 'Termination Assistance',
    who: 'theirs',
    materiality: 'Medium',
    note: 'Transition assistance 30 → 90 days — our position accepted',
    segs: [
      sBase(
        'Upon expiration or termination of this Agreement, Skylark Cloud will provide the transition assistance described in Exhibit E for up to ',
      ),
      sCpDel('thirty (30)'),
      sCpIns('ninety (90)'),
      sBase(
        ' days, at the rates in effect immediately before termination, and will return or delete Customer Data as Kestrel directs.',
      ),
    ],
  },
  {
    id: 'c15-1',
    num: '§ 15.1',
    title: 'Notices',
    who: 'ours',
    materiality: 'Low',
    note: 'Notice copy to Marlow & Voss added in our v5',
    segs: [
      sBase(
        'Notices must be in writing and are deemed given when delivered by hand, by certified mail, or by email with confirmation of receipt, to the addresses on the signature page',
      ),
      sFirmIns(
        ', with a copy (which does not constitute notice) to Marlow & Voss LLP, attention Julian Voss',
      ),
      sBase(
        '. Either party may update its notice address by notice given under this Section.',
      ),
    ],
  },
];

// Meter counts — MUST reconcile with the rail rows and turn chips:
// 4 theirs + 2 ours + 2 both = 8; their v4 turn touched 4+2 = 6 clauses,
// our v5 draft touches 2+2 = 4.
const COUNT_THEIRS = CLAUSES.filter(c => c.who === 'theirs').length;
const COUNT_OURS = CLAUSES.filter(c => c.who === 'ours').length;
const COUNT_BOTH = CLAUSES.filter(c => c.who === 'both').length;

// ---- Casewright turn summary (AI artifact — disclosure + citations) ----

const AI_SUMMARY_TEXT =
  'Skylark’s v4 turn accepted 3 of 5 open positions — the Exhibit B service-credit schedule (§ 4.1), the 24-month initial term (§ 2.1), and 90-day termination assistance (§ 13.4). One new position: a carve-out added in § 9.2 excludes “Customer Configuration Events” from the liability cap, which would swallow the cap for most Customer Data incidents. § 11.3 was also broadened to permit hosting in any Skylark Cloud region.';

// prettier-ignore
const AI_CITATIONS: {clauseId: string; label: string}[] = [
  {clauseId: 'c9-2', label: '§ 9.2 · Limitation of Liability'}, {clauseId: 'c11-3', label: '§ 11.3 · Data Location'},
  {clauseId: 'c4-1', label: '§ 4.1 · Service Credits'}, {clauseId: 'c2-1', label: '§ 2.1 · Term'},
  {clauseId: 'c13-4', label: '§ 13.4 · Transition'},
];

// ---- Position tracker (footer) — 3 agreed · 1 theirs · 1 ours ----

type PositionState = 'agreed' | 'theirs' | 'ours';

interface PositionPoint {
  id: string;
  clauseId: string;
  label: string;
  state: PositionState;
  detail: string;
}

// prettier-ignore
const POSITIONS: PositionPoint[] = [
  {id: 'p-cap', clauseId: 'c9-2', label: 'Liability cap', state: 'theirs',
    detail: 'Their § 9.2 carve-out is the live position; our strike is drafted in v5 but unsent.'},
  {id: 'p-credits', clauseId: 'c4-1', label: 'Service credits', state: 'agreed',
    detail: 'Exhibit B schedule accepted in v4; credits auto-apply to the next invoice.'},
  {id: 'p-data', clauseId: 'c11-3', label: 'Data residency', state: 'ours',
    detail: 'US/Canada-only hosting with 60-day region-change notice — our v5 counter.'},
  {id: 'p-term', clauseId: 'c2-1', label: 'Term & renewal', state: 'agreed',
    detail: '24-month initial term accepted in v4 (renewal notice now 90 days).'},
  {id: 'p-transition', clauseId: 'c13-4', label: 'Termination assistance', state: 'agreed',
    detail: '90-day transition assistance accepted in v4.'},
];

const POSITION_STATE_META: Record<PositionState, {label: string; color: string}> = {
  agreed: {label: 'Agreed', color: AGREED_CHROME},
  theirs: {label: 'Their position', color: CP_CHROME},
  ours: {label: 'Our position', color: FIRM_CHROME},
};

// prettier-ignore
const WHO_META: Record<Who, {label: string; color: string; token: 'orange' | 'blue' | 'purple'}> = {
  theirs: {label: 'Theirs', color: CP_CHROME, token: 'orange'}, ours: {label: 'Ours', color: FIRM_CHROME, token: 'blue'},
  both: {label: 'Both', color: BOTH_CHROME, token: 'purple'},
};

// ============= PANE RENDERING =============
// Pure functions from the attributed segment stream to each pane state.

type LeftRender = 'plain' | 'cpIns' | 'cpDel' | null;
type RightRender = 'plain' | 'firmIns' | 'firmDel' | null;

function leftSegRender(seg: Seg, version: BaseVersion): LeftRender {
  if (version === 'v3') {
    // Clean text as it stood after OUR Jul 2 turn, before Skylark's edits.
    return seg.k === 'base' || seg.k === 'cpDel' || seg.k === 'firmDel'
      ? 'plain'
      : null;
  }
  // v4 with Skylark's tracked changes vs v3.
  switch (seg.k) {
    case 'base':
    case 'firmDel':
      return 'plain';
    case 'cpDel':
      return 'cpDel';
    case 'cpIns':
    case 'cpInsFirmDel':
      return 'cpIns';
    default:
      return null;
  }
}

function rightSegRender(seg: Seg, version: CompareVersion): RightRender {
  if (version === 'v4') {
    // Clean v4 as received Sat Jul 11.
    return seg.k === 'base' ||
      seg.k === 'cpIns' ||
      seg.k === 'cpInsFirmDel' ||
      seg.k === 'firmDel'
      ? 'plain'
      : null;
  }
  // v5 working markup with OUR tracked changes vs v4.
  switch (seg.k) {
    case 'base':
    case 'cpIns':
      return 'plain';
    case 'firmDel':
    case 'cpInsFirmDel':
      return 'firmDel';
    case 'firmIns':
      return 'firmIns';
    default:
      return null;
  }
}

function ClauseParagraph({
  clause,
  pane,
  version,
}: {
  clause: Clause;
  pane: 'left' | 'right';
  version: BaseVersion | CompareVersion;
}) {
  const nodes: ReactNode[] = [];
  clause.segs.forEach((seg, i) => {
    const render =
      pane === 'left'
        ? leftSegRender(seg, version as BaseVersion)
        : rightSegRender(seg, version as CompareVersion);
    if (render === null) {
      return;
    }
    if (render === 'plain') {
      nodes.push(<span key={i}>{seg.text}</span>);
    } else {
      nodes.push(
        <span key={i} style={styles[render]}>
          {seg.text}
        </span>,
      );
    }
  });
  return (
    <>
      <p style={styles.clauseHeading}>
        {clause.num} {clause.title}
      </p>
      <p style={styles.clauseText}>{nodes}</p>
    </>
  );
}

// ============= SUBCOMPONENTS =============

/**
 * Turn-history band: 5 dense turn rows alternating firm/counterparty
 * paper. Turns that map onto a pane selection are buttons (v3/v4 set the
 * base pane, v5 the compare pane); v1/v2 are historical context only.
 */
function TurnBand({
  base,
  compare,
  onPickBase,
  onPickCompare,
}: {
  base: BaseVersion;
  compare: CompareVersion;
  onPickBase: (v: BaseVersion) => void;
  onPickCompare: (v: CompareVersion) => void;
}) {
  return (
    <div style={styles.turnBand} role="list" aria-label="Negotiation turns">
      {TURNS.map(turn => {
        const actor = PEOPLE[turn.actorId];
        const isActive =
          (turn.version === base && (turn.version === 'v3' || turn.version === 'v4')) ||
          turn.version === compare;
        const sideColor = turn.side === 'firm' ? FIRM_CHROME : CP_CHROME;
        const pick =
          turn.version === 'v3' || turn.version === 'v4'
            ? () => onPickBase(turn.version as BaseVersion)
            : turn.version === 'v5'
              ? () => onPickCompare('v5')
              : undefined;
        const body = (
          <>
            <span style={{...styles.turnMarker, backgroundColor: sideColor}} />
            <Avatar name={actor.name} size="small" />
            <div style={styles.turnBody}>
              <HStack gap={1} vAlign="center" wrap="wrap">
                <span style={styles.chipNoShrink}>
                  <Token label={turn.version} size="sm" color="gray" />
                </span>
                <Text type="label" size="sm">
                  {turn.org}
                </Text>
                <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                  {turn.date}
                </Text>
              </HStack>
              <div style={styles.turnSummary}>
                <Text type="supporting" size="xsm" color="secondary">
                  {turn.summary}
                </Text>
              </div>
              <HStack gap={1} vAlign="center">
                <span style={styles.chipNoShrink}>
                  <Token
                    label={turn.chip}
                    size="sm"
                    color={turn.side === 'firm' ? 'blue' : 'orange'}
                  />
                </span>
              </HStack>
            </div>
          </>
        );
        return pick ? (
          <button
            key={turn.version}
            type="button"
            role="listitem"
            onClick={pick}
            aria-pressed={isActive}
            style={{
              ...styles.turnCard,
              ...styles.turnCardClickable,
              ...(isActive ? styles.turnCardActive : null),
            }}>
            {body}
          </button>
        ) : (
          <Tooltip key={turn.version} content="Earlier turn — not in this comparison">
            <div role="listitem" style={styles.turnCard}>
              {body}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}

/** One navigator entry: clause number, who-changed dot, title, note. */
function NavRow({
  clause,
  isSelected,
  onSelect,
}: {
  clause: Clause;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const who = WHO_META[clause.who];
  return (
    <button
      type="button"
      onClick={() => onSelect(clause.id)}
      aria-pressed={isSelected}
      style={{...styles.railRow, ...(isSelected ? styles.railRowActive : null)}}>
      <span
        style={{...styles.legendDot, backgroundColor: who.color, marginTop: 6}}
        aria-hidden
      />
      <span style={styles.railNum}>{clause.num}</span>
      <VStack gap={0} style={{minWidth: 0, flex: 1}}>
        <HStack gap={1} vAlign="center" wrap="wrap">
          <Text type="label" size="sm">
            {clause.title}
          </Text>
          {clause.materiality === 'High' ? (
            <span style={styles.chipNoShrink}>
              <Token label="High materiality" size="sm" color="red" />
            </span>
          ) : null}
          {clause.annotation ? (
            <Tooltip content="Has a privileged firm-internal note">
              <span style={{...styles.chipNoShrink, color: PRIV_INK, display: 'inline-flex'}}>
                <Icon icon={LockIcon} size="xsm" color="inherit" />
              </span>
            </Tooltip>
          ) : null}
        </HStack>
        <Text type="supporting" size="xsm" color="secondary">
          {clause.note}
        </Text>
      </VStack>
    </button>
  );
}

/** Rail legend: the attribution palette, spelled out. */
function RailLegend() {
  return (
    <HStack gap={3} vAlign="center" wrap="wrap" style={{padding: '0 var(--spacing-2)'}}>
      {(Object.keys(WHO_META) as Who[]).map(who => (
        <HStack key={who} gap={1} vAlign="center">
          <span
            style={{...styles.legendDot, backgroundColor: WHO_META[who].color}}
            aria-hidden
          />
          <Text type="supporting" size="xsm" color="secondary">
            {WHO_META[who].label}
          </Text>
        </HStack>
      ))}
    </HStack>
  );
}

/**
 * Casewright turn-summary Card: the AI artifact. Assertion text, citation
 * chips that jump into the diff, honest confidence band, human
 * verification provenance, and the suite disclosure line.
 */
function TurnSummaryCard({onJump}: {onJump: (clauseId: string) => void}) {
  return (
    <div style={styles.summaryWrap}>
      <Card>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Icon icon={SparklesIcon} size="sm" color="secondary" />
            <Text type="label" size="sm">
              Casewright · Turn summary
            </Text>
            <span style={styles.chipNoShrink}>
              <Token label="v4 → v5" size="sm" color="gray" />
            </span>
            <StackItem size="fill" style={{minWidth: 8}}>
              <span />
            </StackItem>
            <span style={styles.chipNoShrink}>
              <Token label="High confidence" size="sm" color="blue" />
            </span>
            <span style={styles.chipNoShrink}>
              <Token
                label="Verified · Ruth Vega · Jul 15"
                size="sm"
                color="green"
                icon={<Icon icon={CheckIcon} size="xsm" color="inherit" />}
              />
            </span>
          </HStack>
          <Text size="sm">{AI_SUMMARY_TEXT}</Text>
          <div style={styles.citationRow}>
            {AI_CITATIONS.map(cite => (
              <span key={cite.clauseId} style={styles.chipNoShrink}>
                <Token
                  label={cite.label}
                  size="sm"
                  color="default"
                  onClick={() => onJump(cite.clauseId)}
                  description={\`Jump to \${cite.label} in the diff\`}
                />
              </span>
            ))}
          </div>
          <Divider />
          <div style={styles.disclosureRow}>
            <Icon icon={SparklesIcon} size="xsm" color="secondary" />
            <Text type="supporting" size="xsm" color="secondary">
              {DISCLOSURE}
            </Text>
          </div>
        </VStack>
      </Card>
    </div>
  );
}

/** Privileged firm-internal annotation row under a clause block. */
function AnnotationRow({annotation}: {annotation: Annotation}) {
  const author = PEOPLE[annotation.authorId];
  return (
    <div style={styles.annotation}>
      <span style={{color: PRIV_INK, display: 'inline-flex', flexShrink: 0, paddingTop: 2}}>
        <Icon icon={LockIcon} size="sm" color="inherit" />
      </span>
      <Avatar name={author.name} size="small" />
      <div style={styles.annotationBody}>
        <VStack gap={1}>
          <HStack gap={1} vAlign="center" wrap="wrap">
            <Text type="label" size="sm">
              {author.name}
            </Text>
            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
              {annotation.when}
            </Text>
            <span style={styles.chipNoShrink}>
              <Token label="Privileged · firm-internal" size="sm" color="yellow" />
            </span>
          </HStack>
          <Text type="supporting" size="sm" color="secondary">
            {annotation.text}
          </Text>
          <Text type="supporting" size="xsm" color="secondary">
            Not shared with the counterparty or the client.
          </Text>
        </VStack>
      </div>
    </div>
  );
}

/**
 * One clause block: chrome row (number, title, who Token, materiality,
 * cross-reference flag), the clause-aligned paper grid, and any
 * privileged annotation. Selection ring is inset so it never bleeds.
 */
function ClauseBlock({
  clause,
  base,
  compare,
  isSelected,
  isStacked,
  onSelect,
}: {
  clause: Clause;
  base: BaseVersion;
  compare: CompareVersion;
  isSelected: boolean;
  isStacked: boolean;
  onSelect: (id: string) => void;
}) {
  const who = WHO_META[clause.who];
  return (
    <section
      id={\`clause-\${clause.id}\`}
      style={{...styles.clauseBlock, ...(isSelected ? styles.clauseSelected : null)}}
      aria-label={\`\${clause.num} \${clause.title}\`}>
      <div style={styles.clauseChrome}>
        <span
          style={{...styles.legendDot, backgroundColor: who.color}}
          aria-hidden
        />
        <Text type="label" size="sm" hasTabularNumbers>
          {clause.num} · {clause.title}
        </Text>
        <span style={styles.chipNoShrink}>
          <Token label={\`Changed · \${who.label.toLowerCase()}\`} size="sm" color={who.token} />
        </span>
        {clause.materiality === 'High' ? (
          <span style={styles.chipNoShrink}>
            <Token label="High materiality" size="sm" color="red" />
          </span>
        ) : null}
        {clause.reviewFlag ? (
          <span style={styles.chipNoShrink}>
            <Token
              label={clause.reviewFlag}
              size="sm"
              color="red"
              icon={<Icon icon={FlagIcon} size="xsm" color="inherit" />}
              onClick={() => onSelect(clause.id)}
              description="Cross-reference: Casewright contract review issue"
            />
          </span>
        ) : null}
      </div>
      <div style={{...styles.clauseGrid, ...(isStacked ? styles.clauseGridStacked : null)}}>
        <div style={styles.paperCell}>
          {isStacked ? (
            <p style={styles.paperCaption}>
              {base === 'v4' ? 'v4 · Skylark turn' : 'v3 · our prior turn'}
            </p>
          ) : null}
          <ClauseParagraph clause={clause} pane="left" version={base} />
        </div>
        <div style={styles.paperCell}>
          {isStacked ? (
            <p style={styles.paperCaption}>
              {compare === 'v5' ? 'v5 · M&V working draft' : 'v4 · as received'}
            </p>
          ) : null}
          <ClauseParagraph clause={clause} pane="right" version={compare} />
        </div>
      </div>
      {clause.annotation ? <AnnotationRow annotation={clause.annotation} /> : null}
    </section>
  );
}

/** Sticky pane-version labels above the clause grid. */
function PaneBar({
  base,
  compare,
  isStacked,
}: {
  base: BaseVersion;
  compare: CompareVersion;
  isStacked: boolean;
}) {
  if (isStacked) {
    return null; // per-cell captions take over below 768px
  }
  return (
    <div style={styles.paneBar}>
      <div style={styles.paneLabel}>
        <span style={{...styles.attribDot, backgroundColor: CP_CHROME}} aria-hidden />
        <Text type="label" size="sm">
          {base === 'v4'
            ? 'v4 — Skylark turn · Jul 11'
            : 'v3 — M&V turn · Jul 2'}
        </Text>
        <span style={styles.chipNoShrink}>
          <Text type="supporting" size="xsm" color="secondary">
            {base === 'v4' ? 'Their changes marked' : 'Clean text'}
          </Text>
        </span>
      </div>
      <div style={styles.paneLabel}>
        <span style={{...styles.attribDot, backgroundColor: FIRM_CHROME}} aria-hidden />
        <Text type="label" size="sm">
          {compare === 'v5'
            ? 'v5 — M&V working draft · Jul 15'
            : 'v4 — as received · Jul 11'}
        </Text>
        <span style={styles.chipNoShrink}>
          <Text type="supporting" size="xsm" color="secondary">
            {compare === 'v5' ? 'Our changes marked' : 'Clean text'}
          </Text>
        </span>
      </div>
    </div>
  );
}

/** Position-tracker footer: 5 points, 3 agreed · 1 theirs · 1 ours. */
function PositionFooter({onJump}: {onJump: (clauseId: string) => void}) {
  const agreed = POSITIONS.filter(p => p.state === 'agreed').length;
  const open = POSITIONS.length - agreed;
  return (
    <LayoutFooter hasDivider padding={0}>
      <div style={styles.footerBar}>
        <Text type="label" size="sm">
          Positions
        </Text>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {agreed} agreed · {open} open
        </Text>
        {POSITIONS.map(point => {
          const meta = POSITION_STATE_META[point.state];
          return (
            <Tooltip key={point.id} content={point.detail}>
              <button
                type="button"
                style={styles.positionChip}
                onClick={() => onJump(point.clauseId)}
                aria-label={\`\${point.label} — \${meta.label}. \${point.detail}\`}>
                <span
                  style={{...styles.positionDot, backgroundColor: meta.color}}
                  aria-hidden
                />
                <Text type="label" size="sm">
                  {point.label}
                </Text>
                <Text type="supporting" size="xsm" color="secondary">
                  {meta.label}
                </Text>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </LayoutFooter>
  );
}

// ============= PAGE =============

export default function ContractDiffNegotiationTemplate() {
  const [base, setBase] = useState<BaseVersion>('v4');
  const [compare, setCompare] = useState<CompareVersion>('v5');
  const [selectedClauseId, setSelectedClauseId] = useState<string>('c9-2');
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const toast = useToast();

  const isRailHidden = useMediaQuery('(max-width: 1024px)');
  const isStacked = useMediaQuery('(max-width: 768px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  const jumpToClause = (clauseId: string) => {
    setSelectedClauseId(clauseId);
    document
      .getElementById(\`clause-\${clauseId}\`)
      ?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const header = (
    <LayoutHeader hasDivider padding={0}>
      <VStack gap={0}>
        <div style={styles.privilegeStrip}>
          <Icon icon={LockIcon} size="xsm" color="inherit" />
          <Text type="supporting" size="xsm" color="inherit">
            Attorney-Client Privileged · Attorney Work Product — do not forward
          </Text>
        </div>
        <div style={styles.headerToolbar}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <IconButton
              label="Back to matter M-2431"
              tooltip="Back to matter"
              size="sm"
              variant="ghost"
              icon={<Icon icon={ArrowLeftIcon} size="sm" color="inherit" />}
              onClick={() => {}}
            />
            <Icon icon={FileTextIcon} size="md" color="secondary" />
            <StackItem size="fill" style={{minWidth: 200}}>
              <VStack gap={0}>
                <Heading level={1}>{DOC_TITLE}</Heading>
                {!isPhone ? (
                  <Text type="supporting" size="xsm" color="secondary">
                    {MATTER_LINE}
                  </Text>
                ) : null}
              </VStack>
            </StackItem>
            <HStack gap={1} vAlign="center" wrap="wrap">
              <Selector
                label="Base version"
                isLabelHidden
                options={BASE_OPTIONS}
                value={base}
                onChange={value => setBase(value as BaseVersion)}
                size="sm"
                width={216}
              />
              <Icon icon={ArrowRightIcon} size="sm" color="secondary" />
              <Selector
                label="Compare version"
                isLabelHidden
                options={COMPARE_OPTIONS}
                value={compare}
                onChange={value => setCompare(value as CompareVersion)}
                size="sm"
                width={216}
              />
            </HStack>
            <Button
              label={isSent ? 'Markup sent' : 'Send markup'}
              variant="primary"
              size="sm"
              isDisabled={isSent}
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              onClick={() => setIsSendOpen(true)}
            />
          </HStack>
          <HStack gap={1} vAlign="center" wrap="wrap" style={{marginTop: 'var(--spacing-2)'}}>
            <span style={{...styles.meterChip, ...styles.meterTotal}}>
              {CLAUSES.length} clauses changed
            </span>
            {!isPhone ? (
              <>
                <span style={{...styles.meterChip, ...styles.meterTheirs}}>
                  {COUNT_THEIRS} theirs
                </span>
                <span style={{...styles.meterChip, ...styles.meterOurs}}>
                  {COUNT_OURS} ours
                </span>
                <span style={{...styles.meterChip, ...styles.meterBoth}}>
                  {COUNT_BOTH} both
                </span>
              </>
            ) : null}
          </HStack>
        </div>
      </VStack>
    </LayoutHeader>
  );

  const railList = (
    <VStack gap={1}>
      <HStack gap={1} vAlign="center" style={{padding: '0 var(--spacing-2)'}}>
        <Text type="label" size="sm">
          Changed clauses
        </Text>
        <Badge label={String(CLAUSES.length)} variant="neutral" />
      </HStack>
      <RailLegend />
      {CLAUSES.map(clause => (
        <NavRow
          key={clause.id}
          clause={clause}
          isSelected={selectedClauseId === clause.id}
          onSelect={jumpToClause}
        />
      ))}
      <Divider />
      <div style={{padding: '0 var(--spacing-2)'}}>
        <Text type="supporting" size="xsm" color="secondary">
          Unchanged sections are collapsed out of this comparison.
        </Text>
      </div>
    </VStack>
  );

  // <=1024px: the navigator collapses to a wrapping chip band in-flow.
  const navChips = (
    <div style={{...styles.navChipBand, marginBottom: 'var(--spacing-2)'}}>
      {CLAUSES.map(clause => (
        <span key={clause.id} style={styles.chipNoShrink}>
          <Token
            label={\`\${clause.num} \${clause.title}\`}
            size="sm"
            color={WHO_META[clause.who].token}
            onClick={() => jumpToClause(clause.id)}
            description={clause.note}
          />
        </span>
      ))}
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        footer={<PositionFooter onJump={jumpToClause} />}
        start={
          !isRailHidden ? (
            <LayoutPanel width={280} padding={0} label="Changed-clause navigator">
              <div style={styles.railScroll}>{railList}</div>
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent padding={0}>
            <VStack gap={0} style={styles.fill}>
              <TurnBand
                base={base}
                compare={compare}
                onPickBase={setBase}
                onPickCompare={setCompare}
              />
              <StackItem size="fill" style={{minHeight: 0, width: '100%'}}>
                <div style={styles.contentScroll}>
                  <div style={styles.contentColumn}>
                    {isRailHidden ? navChips : null}
                    <TurnSummaryCard onJump={jumpToClause} />
                    <PaneBar base={base} compare={compare} isStacked={isStacked} />
                    {CLAUSES.map(clause => (
                      <ClauseBlock
                        key={clause.id}
                        clause={clause}
                        base={base}
                        compare={compare}
                        isSelected={selectedClauseId === clause.id}
                        isStacked={isStacked}
                        onSelect={jumpToClause}
                      />
                    ))}
                  </div>
                </div>
              </StackItem>
            </VStack>
          </LayoutContent>
        }
      />
      <AlertDialog
        isOpen={isSendOpen}
        onOpenChange={setIsSendOpen}
        title="Send v5 markup to Marta Reyes (Skylark Cloud)?"
        description="Only the redlined document is shared — Casewright's turn summary and the 2 privileged firm-internal annotations stay inside Marlow & Voss. Sending records a turn in the matter file and can't be unsent."
        actionLabel="Send markup"
        cancelLabel="Keep working"
        onAction={() => {
          setIsSendOpen(false);
          setIsSent(true);
          toast({
            body: 'v5 markup sent to Marta Reyes · Skylark Cloud (matter M-2431)',
            uniqueID: 'contract-diff-send',
          });
        }}
      />
    </div>
  );
}
`;export{e as default};