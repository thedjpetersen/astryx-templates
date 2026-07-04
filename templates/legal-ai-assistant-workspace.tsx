// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (Casewright matter corpus for Marlow &
 *   Voss LLP — three Kestrel Labs matters with document counts and key
 *   dates, recent assistant threads per matter, one full Q&A exchange with
 *   citation chips and verification fixtures, four retrieved sources with
 *   relevance rankings; fixed ISO timestamps in July 2026, no clocks, no
 *   randomness, no network media).
 * @output Legal AI Assistant Workspace — Casewright's ask-anything surface
 *   for Marlow & Voss LLP. Left matter-context rail (matter switcher with
 *   doc counts, active-matter key dates and team, recent assistant
 *   threads); center assistant thread — Priya Khanna's diligence query on
 *   the Skylark MSA indemnification carve-outs and Casewright's structured
 *   answer: numbered points with citation chips (doc + section), per-point
 *   verification chips (2 verified by P. Khanna, 1 amber unverified with an
 *   explicit Verify action), an inline light-locked quoted-passage card
 *   with an amber highlight wash, honest confidence bands, the
 *   "AI-generated · verify before relying" disclosure footer, and follow-up
 *   suggestion chips; right sources panel listing the 4 cited documents
 *   with labeled retrieval-relevance bars and open affordances; docked
 *   composer with an Ask/Draft/Summarize mode select and a matter-scope
 *   chip.
 * @position Page template; emitted by `astryx template
 *   legal-ai-assistant-workspace`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (Casewright brand + firm, New thread, user) with the privilege
 *   strip pinned beneath the header row | start rail 280 (matter switcher,
 *   active-matter context, recent threads, pinned AI-usage-log note)
 *   | content (centered ChatLayout <= 840: transcript scrolls, composer
 *   docked) | end panel 320 (cited sources, pinned relevance footnote).
 *
 * Container policy: app-shell — frame rows and panels only; Cards appear
 *   solely inside the chat transcript for genuine AI artifacts (the
 *   retrieval trace and the structured answer), matching
 *   ai-chat-tool-stream's tool-pile precedent. Rail and sources rows are
 *   List rows / styled divs, never Cards.
 *
 * Color policy: token-pure chrome. The verification vocabulary rides Token
 *   colors (green verified / orange unverified / red retracted) and the
 *   suite's shared sparkle disclosure treatment. The ONE scheme exception
 *   is the quoted-passage paper chip: light-locked (colorScheme 'light',
 *   explicit literals, serif stack) per the doc-comments-review paper
 *   idiom; its amber highlight wash is a literal pinned to that light lock
 *   and never flips.
 *
 * Responsive contract:
 * - > 1180px: full three-region frame.
 * - <= 1180px: the sources panel is dropped — citation chips keep carrying
 *   doc + section so no assertion loses its source.
 * - <= 880px: the matter rail is dropped; the composer's matter-scope chip
 *   remains the thread's scope indicator; the header row wraps instead of
 *   clipping.
 * - The transcript is the only scroller in the center column (ChatLayout
 *   owns it); the rail and the sources panel scroll independently with
 *   `minHeight: 0` down their flex chains; the privilege strip, rail
 *   footer, and sources footnote are pinned.
 */

import {useState, type CSSProperties} from 'react';

import {
  BriefcaseIcon,
  CheckIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  LockIcon,
  MessageSquareTextIcon,
  PlusIcon,
  ScaleIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
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
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun 6: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport. The privilege
  // strip sits above the Layout, so the root is a flex column and the
  // Layout fills the remainder.
  root: {
    height: '100dvh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  layoutWrap: {flex: 1, minHeight: 0},

  // ----- header + privilege strip -----
  brandMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-accent-light, var(--color-background-muted))',
    color: 'var(--color-accent)',
    flexShrink: 0,
  },
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  privilegeStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },

  // ----- matter rail -----
  railFill: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  railScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-2)',
  },
  railSection: {paddingInline: 'var(--spacing-2)', paddingTop: 'var(--spacing-2)'},
  keyDateRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'},
  railFooter: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  noShrink: {flexShrink: 0},

  // ----- center thread -----
  // Flex column so ChatLayout's `flex: 1; minHeight: 0` engages and the
  // transcript (not LayoutContent) is the scroller with the composer docked.
  chatColumn: {
    height: '100%',
    minHeight: 0,
    width: '100%',
    maxWidth: 840,
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  aiAvatar: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-accent)',
    flexShrink: 0,
  },
  retrievalStep: {paddingBlock: 'var(--spacing-1)'},
  pointRow: {display: 'flex', gap: 'var(--spacing-3)', alignItems: 'flex-start'},
  pointNum: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
    marginTop: 2,
  },
  pointBody: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)'},
  chipRow: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1)', alignItems: 'center'},
  // Footgun 18: status/citation Tokens sharing a row with wrapping prose
  // never shrink — the prose wraps instead.
  chipNoShrink: {flexShrink: 0, whiteSpace: 'nowrap'},

  // ----- light-locked quoted-passage paper chip (see Color policy) -----
  paperCard: {
    colorScheme: 'light',
    backgroundColor: '#FDFBF7',
    border: '1px solid #E4DECF',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-4)',
  },
  paperClauseHead: {
    fontFamily: "Georgia, 'Times New Roman', Times, serif",
    fontSize: 13,
    fontWeight: 700,
    color: '#211E18',
    marginBottom: 'var(--spacing-2)',
  },
  paperQuote: {
    fontFamily: "Georgia, 'Times New Roman', Times, serif",
    fontSize: 13.5,
    lineHeight: 1.7,
    color: '#33302A',
    margin: 0,
  },
  paperHighlight: {
    backgroundColor: '#FBE7A2',
    color: '#211E18',
    padding: '0 2px',
    borderRadius: 2,
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
  } as CSSProperties,
  paperSourceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    rowGap: 'var(--spacing-1)',
  },

  // ----- answer footer + follow-ups -----
  disclosureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    rowGap: 'var(--spacing-1)',
  },
  disclosureText: {minWidth: 0, flex: '1 1 200px'},
  followUpWrap: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)'},

  // ----- sources panel -----
  sourcesFill: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  sourcesHead: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  sourcesScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  sourceRow: {
    width: '100%',
    textAlign: 'start',
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    border: 'none',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  // Inset outline so the active ring never bleeds onto neighbors.
  sourceRowActive: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  sourceBody: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  sectionChipRow: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1)'},
  relevanceRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'},
  // Footgun 12: ProgressBar enforces minWidth 48 — release it for the
  // compact in-row relevance bar.
  relevanceBar: {flex: 1, minWidth: 0},
  relevancePct: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  sourcesFootnote: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
    borderTop: 'var(--border-width) solid var(--color-border)',
  },

  // ----- composer -----
  composerArea: {paddingTop: 'var(--spacing-2)'},
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
  composerTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    rowGap: 'var(--spacing-2)',
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures, Casewright at Marlow & Voss LLP.
// Suite "now" anchor: Wednesday, July 15, 2026.
// ---------------------------------------------------------------------------

const FIRM_NAME = 'Marlow & Voss LLP';
const CURRENT_USER = 'Priya Khanna';
const DISCLOSURE = 'AI-generated · verify before relying';

interface Matter {
  id: string;
  number: string;
  name: string;
  shortName: string;
  lead: string;
  dayToDay: string;
  docsIndexed: number;
  threads: number;
  indexedAt: string; // rendered fixed string
  keyDates: ReadonlyArray<{id: string; label: string; date: string}>;
}

const MATTERS: Matter[] = [
  {
    id: 'm-2417',
    number: 'M-2417',
    name: 'Kestrel Labs — Series C Financing',
    shortName: 'Series C Financing',
    lead: 'Eleanor Marlow',
    dayToDay: 'Priya Khanna',
    docsIndexed: 24,
    threads: 12,
    indexedAt: 'Indexed Jul 15 · 8:40 AM',
    keyDates: [
      {id: 'kd-1', label: 'Disclosure schedules', date: 'Mon Jul 20'},
      {id: 'kd-2', label: 'First close (target)', date: 'Fri Jul 31'},
    ],
  },
  {
    id: 'm-2431',
    number: 'M-2431',
    name: 'Kestrel Labs — Atlas Launch Vendor Agreements',
    shortName: 'Atlas Vendor Agreements',
    lead: 'Julian Voss',
    dayToDay: 'David Chen',
    docsIndexed: 18,
    threads: 9,
    indexedAt: 'Indexed Jul 15 · 8:40 AM',
    keyDates: [
      {id: 'kd-3', label: 'Larchpay agreement (exec.)', date: 'Mon Jul 20'},
      {id: 'kd-4', label: 'Skylark MSA (exec.)', date: 'Fri Jul 24'},
    ],
  },
  {
    id: 'm-2402',
    number: 'M-2402',
    name: 'Kestrel Labs — HQ Lease, Second Amendment',
    shortName: 'HQ Lease, 2nd Amendment',
    lead: 'Julian Voss',
    dayToDay: 'Amara Osei',
    docsIndexed: 7,
    threads: 3,
    indexedAt: 'Indexed Jul 14 · 6:15 PM',
    keyDates: [
      {id: 'kd-5', label: 'Execution (target)', date: 'Wed Jul 29'},
    ],
  },
];

type ThreadMode = 'ask' | 'draft' | 'summarize';

const MODE_LABEL: Record<ThreadMode, string> = {
  ask: 'Ask',
  draft: 'Draft',
  summarize: 'Summarize',
};

interface RecentThread {
  id: string;
  matterId: string;
  title: string;
  mode: ThreadMode;
  when: string;
  flag?: string; // e.g. a retracted citation marker
}

// The drag-along thread (rq-2) is the research-copilot session whose
// Renwick citation Casewright retracted — the flag reconciles with the
// citation-check block and the AI usage log.
const RECENT_THREADS: RecentThread[] = [
  {
    id: 'rq-1',
    matterId: 'm-2417',
    title: 'Indemnification carve-outs — Skylark MSA drafts',
    mode: 'ask',
    when: 'Jul 15 · 10:24 AM',
  },
  {
    id: 'rq-2',
    matterId: 'm-2417',
    title: 'Drag-along enforceability vs non-signing junior preferred',
    mode: 'ask',
    when: 'Jul 14 · 4:12 PM',
    flag: '1 citation retracted',
  },
  {
    id: 'rq-3',
    matterId: 'm-2417',
    title: 'Summarize Meridian comments on SPA v3',
    mode: 'summarize',
    when: 'Jul 14 · 11:05 AM',
  },
  {
    id: 'rq-4',
    matterId: 'm-2417',
    title: 'Disclosure-schedule entry — material contracts',
    mode: 'draft',
    when: 'Jul 13 · 3:40 PM',
  },
  {
    id: 'rq-5',
    matterId: 'm-2417',
    title: 'Registration rights — IRA draft vs firm playbook',
    mode: 'ask',
    when: 'Jul 13 · 9:18 AM',
  },
  {
    id: 'rq-6',
    matterId: 'm-2431',
    title: 'Chargeback liability shift — Larchpay v2 → v3',
    mode: 'summarize',
    when: 'Jul 14 · 2:30 PM',
  },
  {
    id: 'rq-7',
    matterId: 'm-2431',
    title: 'Skylark § 9.2 cap — review flags recap',
    mode: 'ask',
    when: 'Jul 14 · 9:47 AM',
  },
  {
    id: 'rq-8',
    matterId: 'm-2402',
    title: 'Harrow Point draft — expansion premises issues',
    mode: 'summarize',
    when: 'Jul 13 · 5:02 PM',
  },
];

// ----- cited sources (right panel) -----

interface Source {
  id: string;
  name: string;
  meta: string;
  scope: string; // matter or corpus the doc is indexed under
  sections: string[];
  relevance: number; // retrieval ranking, 0–100 — labeled as such, not legal weight
}

const SOURCES: Source[] = [
  {
    id: 'src-msa-v4',
    name: 'Skylark Cloud MSA — draft v4',
    meta: 'Counterparty turn · received Sat Jul 11',
    scope: 'M-2431',
    sections: ['§ 9.2', '§ 11.2(b)', '§ 11.3', '§ 11.4'],
    relevance: 92,
  },
  {
    id: 'src-msa-v3',
    name: 'Skylark Cloud MSA — draft v3',
    meta: 'M&V markup · circulated Thu Jul 2',
    scope: 'M-2431',
    sections: ['§ 9.2', '§ 11.2'],
    relevance: 84,
  },
  {
    id: 'src-order-form',
    name: 'Kestrel–Skylark Order Form — draft v2',
    meta: 'Exhibit A · pricing & service credits',
    scope: 'M-2431',
    sections: ['§ 6'],
    relevance: 61,
  },
  {
    id: 'src-playbook',
    name: 'Indemnification playbook — M&V standard positions',
    meta: 'Ruth Vega · rev. May 2026',
    scope: 'Firm playbook',
    sections: ['Fallbacks 3.1–3.4'],
    relevance: 47,
  },
];

// ----- the structured answer -----

type PointVerification =
  | {state: 'verified'; by: string; when: string}
  | {state: 'unverified'};

interface CitationRef {
  id: string;
  label: string; // doc name + section, e.g. "MSA v4 · § 11.2(b)"
  sourceId: string;
}

interface AnswerPoint {
  id: string;
  text: string;
  citations: CitationRef[];
  confidence: 'High' | 'Medium' | 'Low';
  verification: PointVerification;
}

const ANSWER_LEDE =
  'The Skylark drafts carve indemnification out of the liability cap in ' +
  'three places, and the counterparty v4 turn narrows two of them. ' +
  'Point-by-point, with the operative sections:';

const ANSWER_POINTS: AnswerPoint[] = [
  {
    id: 'pt-1',
    text:
      'IP-infringement indemnity (Skylark → Kestrel) remains fully uncapped ' +
      'in both drafts, but v4 narrows the duty itself: § 11.2(b) now ' +
      'excludes claims arising from Kestrel modifications, combination ' +
      'with non-Skylark systems, or continued use after notice. The ' +
      'combination exclusion is new in the counterparty turn.',
    citations: [
      {id: 'c-1a', label: 'MSA v4 · § 11.2(b)', sourceId: 'src-msa-v4'},
      {id: 'c-1b', label: 'MSA v3 · § 11.2', sourceId: 'src-msa-v3'},
    ],
    confidence: 'High',
    verification: {state: 'verified', by: 'P. Khanna', when: 'Jul 15 · 10:41 AM'},
  },
  {
    id: 'pt-2',
    text:
      'The M&V v3 markup carved all § 11 indemnification obligations out ' +
      'of the § 9.2 limitation of liability. Skylark’s v4 turn accepts ' +
      'the carve-out for IP claims but pulls data-protection indemnity ' +
      '(§ 11.4) back under a 3× fees super-cap — the same § 9.2 issue the ' +
      'Casewright review of v4 flagged on Jul 14.',
    citations: [
      {id: 'c-2a', label: 'MSA v4 · § 9.2', sourceId: 'src-msa-v4'},
      {id: 'c-2b', label: 'MSA v4 · § 11.4', sourceId: 'src-msa-v4'},
      {id: 'c-2c', label: 'Playbook · Fallback 3.2', sourceId: 'src-playbook'},
    ],
    confidence: 'High',
    verification: {state: 'verified', by: 'P. Khanna', when: 'Jul 15 · 10:46 AM'},
  },
  {
    id: 'pt-3',
    text:
      'The mutual indemnity for third-party bodily-injury and property ' +
      'claims (§ 11.3) appears unchanged across the drafts. Note, however, ' +
      'that the Order Form states service credits as the exclusive remedy ' +
      'for availability failures — which may cut against reading § 11.3 to ' +
      'reach downtime-related third-party losses.',
    citations: [
      {id: 'c-3a', label: 'MSA v4 · § 11.3', sourceId: 'src-msa-v4'},
      {id: 'c-3b', label: 'Order Form v2 · § 6', sourceId: 'src-order-form'},
    ],
    confidence: 'Medium',
    verification: {state: 'unverified'},
  },
];

// Quoted passage rendered on the light-locked paper chip; the highlight
// span is the v4 proviso that re-caps § 11.4 data-protection indemnity.
const QUOTE_HEAD = '9.2 Limitation of Liability.';
const QUOTE_BEFORE =
  'EXCEPT FOR LIABILITY ARISING UNDER SECTION 11.2 (IP INDEMNIFICATION) ' +
  'OR A PARTY’S BREACH OF SECTION 8 (CONFIDENTIALITY), NEITHER ' +
  'PARTY’S AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL EXCEED THE ' +
  'FEES PAID OR PAYABLE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM; ';
const QUOTE_HIGHLIGHT =
  'PROVIDED, THAT LIABILITY ARISING UNDER SECTION 11.4 (DATA PROTECTION ' +
  'INDEMNIFICATION) SHALL NOT EXCEED THREE (3) TIMES SUCH FEES.';
const QUOTE_SOURCE_LABEL = 'Skylark Cloud MSA — draft v4 · § 9.2, p. 18';
const QUOTE_NOTE =
  'Highlighted: new in v4 — the v3 markup carved § 11.4 out of the cap entirely.';

const FOLLOW_UPS: ReadonlyArray<{id: string; label: string}> = [
  {id: 'fu-1', label: 'Compare § 11.2 carve-outs v3 → v4'},
  // Button labels never wrap — the longest follow-up sets the answer
  // card's min-content width, so keep each one compact.
  {id: 'fu-2', label: 'Draft the disclosure-schedule entry'},
  {id: 'fu-3', label: 'Where else does indemnity escape § 9.2?'},
];

const USER_QUERY =
  'What are the indemnification carve-outs in the Skylark MSA drafts? ' +
  'I’m building the material-contracts entry for the disclosure ' +
  'schedules and need to know where indemnity escapes the liability cap.';

// Retrieval trace shown collapsed above the answer — subordinate to the
// cited answer, never the hero (ai-chat-tool-stream owns tool-story chat).
const RETRIEVAL_STEPS: ReadonlyArray<{id: string; label: string; detail: string}> = [
  {
    id: 'rs-1',
    label: 'Scoped query',
    detail: 'M-2417 · Series C Financing + linked matter M-2431 (shared Kestrel corpus)',
  },
  {
    id: 'rs-2',
    label: 'Searched 42 indexed documents',
    detail:
      '24 in M-2417 + 18 in linked M-2431 · 14 passages matched “indemnif*”, “carve-out”, “limitation of liability”',
  },
  {
    id: 'rs-3',
    label: 'Retained 4 sources',
    detail: 'Ranked by retrieval relevance; below-threshold passages dropped',
  },
];

// ---------------------------------------------------------------------------
// SHARED TRUST TREATMENTS
// ---------------------------------------------------------------------------

/**
 * The suite's shared AI-disclosure line: sparkle glyph + small secondary
 * text. Rendered under every AI artifact — never buried, never shouting.
 */
function DisclosureLine({suffix}: {suffix?: string}) {
  return (
    <div style={styles.disclosureRow}>
      <Icon icon={SparklesIcon} size="sm" color="secondary" />
      <div style={styles.disclosureText}>
        <Text type="supporting" size="xsm" color="secondary">
          {suffix != null ? `${DISCLOSURE} · ${suffix}` : DISCLOSURE}
        </Text>
      </div>
    </div>
  );
}

/**
 * Per-point verification chip. Verified points carry actor + timestamp
 * provenance (human verification is an explicit act — AI output never
 * self-verifies); unverified points stay amber and expose the Verify
 * action that flips them.
 */
function VerificationChip({
  verification,
  onVerify,
}: {
  verification: PointVerification;
  onVerify?: () => void;
}) {
  if (verification.state === 'verified') {
    return (
      <span style={styles.chipNoShrink}>
        <Token
          size="sm"
          color="green"
          icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
          label={`Verified · ${verification.by} · ${verification.when}`}
        />
      </span>
    );
  }
  return (
    <>
      <span style={styles.chipNoShrink}>
        <Token
          size="sm"
          color="orange"
          label="Unverified · not yet checked against source"
        />
      </span>
      {onVerify != null && (
        <Button label="Verify" variant="ghost" size="sm" onClick={onVerify} />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// RETRIEVAL TRACE (collapsed, subordinate to the answer)
// ---------------------------------------------------------------------------

function RetrievalTrace() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Card padding={3}>
      <Collapsible
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        trigger={
          <HStack gap={2} vAlign="center">
            <Icon icon={SearchIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Searched 42 documents · 4 sources retained
              </Text>
            </StackItem>
            <StatusDot variant="success" label="Retrieval complete" />
          </HStack>
        }>
        <VStack gap={0}>
          {RETRIEVAL_STEPS.map((step, index) => (
            <VStack key={step.id} gap={0}>
              <VStack gap={0} style={styles.retrievalStep}>
                <Text type="supporting" size="sm">
                  {step.label}
                </Text>
                <Text type="supporting" size="xsm" color="secondary">
                  {step.detail}
                </Text>
              </VStack>
              {index < RETRIEVAL_STEPS.length - 1 ? <Divider /> : null}
            </VStack>
          ))}
        </VStack>
      </Collapsible>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// QUOTED PASSAGE — light-locked serif paper chip (see Color policy)
// ---------------------------------------------------------------------------

function QuotedPassageCard({onOpenSource}: {onOpenSource: () => void}) {
  return (
    <VStack gap={2}>
      <blockquote style={{...styles.paperCard, margin: 0}}>
        <div style={styles.paperClauseHead}>{QUOTE_HEAD}</div>
        <p style={styles.paperQuote}>
          {QUOTE_BEFORE}
          <mark style={styles.paperHighlight}>{QUOTE_HIGHLIGHT}</mark>
        </p>
      </blockquote>
      <div style={styles.paperSourceRow}>
        <Icon icon={FileTextIcon} size="sm" color="secondary" />
        <Text type="supporting" size="xsm" color="secondary">
          {QUOTE_SOURCE_LABEL}
        </Text>
        <span style={styles.chipNoShrink}>
          <Token size="sm" color="orange" label="Changed in v4" />
        </span>
        <StackItem size="fill" />
        <Button
          label="Open in document"
          variant="ghost"
          size="sm"
          onClick={onOpenSource}
        />
      </div>
      <Text type="supporting" size="xsm" color="secondary">
        {QUOTE_NOTE}
      </Text>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// STRUCTURED ANSWER
// ---------------------------------------------------------------------------

function AnswerPointRow({
  point,
  index,
  verification,
  onVerify,
  onCite,
}: {
  point: AnswerPoint;
  index: number;
  verification: PointVerification;
  onVerify: (id: string) => void;
  onCite: (sourceId: string) => void;
}) {
  return (
    <div style={styles.pointRow}>
      <span style={styles.pointNum} aria-hidden>
        {index + 1}
      </span>
      <div style={styles.pointBody}>
        <Text type="body" size="sm">
          {point.text}
        </Text>
        <div style={styles.chipRow}>
          {point.citations.map(citation => (
            <span key={citation.id} style={styles.chipNoShrink}>
              <Token
                size="sm"
                color="blue"
                icon={<Icon icon={FileTextIcon} size="sm" color="inherit" />}
                label={citation.label}
                description={`Cited source: ${citation.label}`}
                onClick={() => onCite(citation.sourceId)}
              />
            </span>
          ))}
          <Text type="supporting" size="xsm" color="secondary">
            {point.confidence} confidence
          </Text>
        </div>
        <div style={styles.chipRow}>
          <VerificationChip
            verification={verification}
            onVerify={
              verification.state === 'unverified'
                ? () => onVerify(point.id)
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Casewright's structured answer Card: lede, three numbered points with
 * citation + verification chips, the inline quoted-passage paper chip
 * under point 2, and the disclosure footer. The verified count in the
 * header reconciles with the per-point chips.
 */
function AnswerCard({
  verifications,
  onVerify,
  onCite,
  onFollowUp,
}: {
  verifications: Record<string, PointVerification>;
  onVerify: (id: string) => void;
  onCite: (sourceId: string) => void;
  onFollowUp: (label: string) => void;
}) {
  const verifiedCount = ANSWER_POINTS.filter(
    point => verifications[point.id]?.state === 'verified',
  ).length;
  return (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center">
          <Icon icon={SparklesIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="supporting" size="xsm" color="secondary">
              Casewright · Answer
            </Text>
          </StackItem>
          <Text
            type="supporting"
            size="xsm"
            color="secondary"
            hasTabularNumbers>
            {`3 points · ${verifiedCount} verified · 4 sources`}
          </Text>
        </HStack>
        <Text type="body" size="sm">
          {ANSWER_LEDE}
        </Text>
        {ANSWER_POINTS.map((point, index) => (
          <VStack key={point.id} gap={3}>
            <AnswerPointRow
              point={point}
              index={index}
              verification={verifications[point.id] ?? point.verification}
              onVerify={onVerify}
              onCite={onCite}
            />
            {point.id === 'pt-2' ? (
              <QuotedPassageCard onOpenSource={() => onCite('src-msa-v4')} />
            ) : null}
            {index < ANSWER_POINTS.length - 1 ? <Divider /> : null}
          </VStack>
        ))}
        <Divider />
        <DisclosureLine suffix="Generated Jul 15 · 10:24 AM" />
        <div style={styles.followUpWrap}>
          {FOLLOW_UPS.map(followUp => (
            <Button
              key={followUp.id}
              label={followUp.label}
              variant="secondary"
              size="sm"
              onClick={() => onFollowUp(followUp.label)}
            />
          ))}
        </div>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// MATTER-CONTEXT RAIL (start panel)
// ---------------------------------------------------------------------------

function MatterRail({
  activeMatterId,
  onSelectMatter,
  activeThreadId,
  onSelectThread,
}: {
  activeMatterId: string;
  onSelectMatter: (id: string) => void;
  activeThreadId: string;
  onSelectThread: (id: string) => void;
}) {
  const activeMatter =
    MATTERS.find(matter => matter.id === activeMatterId) ?? MATTERS[0];
  const threads = RECENT_THREADS.filter(
    thread => thread.matterId === activeMatterId,
  );
  return (
    <div style={styles.railFill}>
      <div style={styles.railScroll}>
        <VStack gap={3}>
          <div style={styles.railSection}>
            <Text type="label" size="sm" color="secondary">
              Matters · Kestrel Labs
            </Text>
          </div>
          <List aria-label="Matters">
            {MATTERS.map(matter => (
              <ListItem
                key={matter.id}
                label={matter.name}
                description={`${matter.number} · ${matter.docsIndexed} documents · ${matter.threads} threads`}
                startContent={
                  <Icon icon={BriefcaseIcon} size="sm" color="secondary" />
                }
                isSelected={matter.id === activeMatterId}
                onClick={() => onSelectMatter(matter.id)}
              />
            ))}
          </List>
          <Divider />
          <div style={styles.railSection}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text type="label" size="sm" color="secondary">
                    {activeMatter.number}
                  </Text>
                </StackItem>
                <span style={styles.noShrink}>
                  <Token
                    size="sm"
                    color="red"
                    icon={<Icon icon={LockIcon} size="sm" color="inherit" />}
                    label="Privileged"
                  />
                </span>
              </HStack>
              <HStack gap={2} vAlign="center">
                <StatusDot variant="success" label="Corpus indexed" />
                <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                  {`${activeMatter.docsIndexed} documents · ${activeMatter.indexedAt}`}
                </Text>
              </HStack>
              {activeMatter.keyDates.map(keyDate => (
                <div key={keyDate.id} style={styles.keyDateRow}>
                  <Icon icon={ClockIcon} size="sm" color="secondary" />
                  <StackItem size="fill">
                    <Text type="supporting" size="xsm">
                      {keyDate.label}
                    </Text>
                  </StackItem>
                  <Text
                    type="supporting"
                    size="xsm"
                    color="secondary"
                    hasTabularNumbers>
                    {keyDate.date}
                  </Text>
                </div>
              ))}
              <Text type="supporting" size="xsm" color="secondary">
                {`Lead ${activeMatter.lead} · day-to-day ${activeMatter.dayToDay} · client contact Elena Voss (Kestrel finance)`}
              </Text>
            </VStack>
          </div>
          <Divider />
          <div style={styles.railSection}>
            <Text type="label" size="sm" color="secondary">
              Recent Casewright threads
            </Text>
          </div>
          <List aria-label="Recent Casewright threads">
            {threads.map(thread => (
              <ListItem
                key={thread.id}
                label={thread.title}
                description={
                  thread.flag != null
                    ? `${MODE_LABEL[thread.mode]} · ${thread.when} · ${thread.flag}`
                    : `${MODE_LABEL[thread.mode]} · ${thread.when}`
                }
                startContent={
                  <Icon
                    icon={MessageSquareTextIcon}
                    size="sm"
                    color="secondary"
                  />
                }
                endContent={
                  thread.flag != null ? (
                    <span style={styles.noShrink}>
                      <Token size="sm" color="red" label="Retracted" />
                    </span>
                  ) : undefined
                }
                isSelected={thread.id === activeThreadId}
                onClick={() => onSelectThread(thread.id)}
              />
            ))}
          </List>
        </VStack>
      </div>
      <div style={styles.railFooter}>
        <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
        <Text type="supporting" size="xsm" color="secondary">
          All Casewright activity on this matter is recorded to the firm’s
          AI usage log.
        </Text>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SOURCES PANEL (end panel)
// ---------------------------------------------------------------------------

function SourceRow({
  source,
  isActive,
  onSelect,
}: {
  source: Source;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  // A div-with-button-semantics row (not a <button>) so the nested
  // open-document IconButton stays valid HTML.
  return (
    <div
      role="button"
      tabIndex={0}
      style={
        isActive
          ? {...styles.sourceRow, ...styles.sourceRowActive}
          : styles.sourceRow
      }
      aria-pressed={isActive}
      onClick={() => onSelect(source.id)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(source.id);
        }
      }}>
      <Icon icon={FileTextIcon} size="sm" color="secondary" />
      <div style={styles.sourceBody}>
        <Text type="body" size="sm" weight="bold">
          {source.name}
        </Text>
        <Text type="supporting" size="xsm" color="secondary">
          {`${source.meta} · ${source.scope}`}
        </Text>
        <div style={styles.sectionChipRow}>
          {source.sections.map(section => (
            <span key={section} style={styles.chipNoShrink}>
              <Token size="sm" color="gray" label={section} />
            </span>
          ))}
        </div>
        <div style={styles.relevanceRow}>
          <div style={styles.relevanceBar}>
            <ProgressBar
              value={source.relevance}
              max={100}
              label={`Retrieval relevance for ${source.name}`}
              isLabelHidden
              style={{minWidth: 0}}
            />
          </div>
          <Text
            type="supporting"
            size="xsm"
            color="secondary"
            style={styles.relevancePct}>
            {`${source.relevance}%`}
          </Text>
        </div>
      </div>
      <IconButton
        label={`Open ${source.name}`}
        tooltip="Open document"
        icon={<Icon icon={ExternalLinkIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={event => event.stopPropagation()}
      />
    </div>
  );
}

function SourcesPanel({
  activeSourceId,
  onSelectSource,
}: {
  activeSourceId: string | null;
  onSelectSource: (id: string) => void;
}) {
  return (
    <div style={styles.sourcesFill}>
      <div style={styles.sourcesHead}>
        <VStack gap={1}>
          <Heading level={2}>Sources</Heading>
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            4 documents cited in this answer
          </Text>
        </VStack>
      </div>
      <div style={styles.sourcesScroll}>
        {SOURCES.map(source => (
          <SourceRow
            key={source.id}
            source={source}
            isActive={source.id === activeSourceId}
            onSelect={onSelectSource}
          />
        ))}
      </div>
      <div style={styles.sourcesFootnote}>
        <Text type="supporting" size="xsm" color="secondary">
          Relevance reflects retrieval ranking, not legal weight. Open each
          source before relying on a cited passage.
        </Text>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const INITIAL_VERIFICATIONS: Record<string, PointVerification> =
  Object.fromEntries(
    ANSWER_POINTS.map(point => [point.id, point.verification]),
  );

export default function LegalAiAssistantWorkspaceTemplate() {
  const [activeMatterId, setActiveMatterId] = useState('m-2417');
  const [activeThreadId, setActiveThreadId] = useState('rq-1');
  const [verifications, setVerifications] = useState(INITIAL_VERIFICATIONS);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [mode, setMode] = useState<ThreadMode>('ask');
  const [draft, setDraft] = useState('');
  const [sentMessages, setSentMessages] = useState<string[]>([]);

  const isNarrow = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 880px)');

  // Human verification is an explicit act with actor + timestamp; the
  // fixture records the signed-in reviewer at a fixed suite-clock time.
  const verifyPoint = (id: string) => {
    setVerifications(prev => ({
      ...prev,
      [id]: {state: 'verified', by: 'P. Khanna', when: 'Jul 15 · 11:02 AM'},
    }));
  };

  // Citation chips point at their source row in the end panel; clicking
  // the active chip's source again clears the ring.
  const citeSource = (sourceId: string) => {
    setActiveSourceId(prev => (prev === sourceId ? null : sourceId));
  };

  const fillFollowUp = (label: string) => {
    setDraft(label);
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (text.length === 0) {
      return;
    }
    setSentMessages(prev => [...prev, text]);
    setDraft('');
  };

  const composer = (
    <VStack gap={2} style={styles.composerArea}>
      <div style={styles.composerCard}>
        <VStack gap={2}>
          <div style={styles.composerTopRow}>
            <SegmentedControl
              label="Assistant mode"
              size="sm"
              value={mode}
              onChange={value => setMode(value as ThreadMode)}>
              <SegmentedControlItem label="Ask" value="ask" />
              <SegmentedControlItem label="Draft" value="draft" />
              <SegmentedControlItem label="Summarize" value="summarize" />
            </SegmentedControl>
            <span style={styles.noShrink}>
              <Token
                size="sm"
                color="gray"
                icon={<Icon icon={ScaleIcon} size="sm" color="inherit" />}
                label="Scope: M-2417 · Series C Financing"
                description="This thread answers only from documents indexed to M-2417 and its linked matters"
              />
            </span>
            <StackItem size="fill" />
            {!isCompact && (
              <Text
                type="supporting"
                size="xsm"
                color="secondary"
                hasTabularNumbers>
                42 documents in scope · incl. linked M-2431
              </Text>
            )}
          </div>
          <TextArea
            label="Ask Casewright about this matter"
            isLabelHidden
            rows={2}
            placeholder="Ask about this matter’s documents — every answer cites its sources…"
            value={draft}
            onChange={setDraft}
          />
          <HStack gap={2} vAlign="center">
            <Icon icon={SparklesIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text type="supporting" size="xsm" color="secondary">
                Casewright can make mistakes — verify citations before
                relying.
              </Text>
            </StackItem>
            <Button
              label="Send"
              size="sm"
              isDisabled={draft.trim().length === 0}
              onClick={sendDraft}
            />
          </HStack>
        </VStack>
      </div>
    </VStack>
  );

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" style={styles.headerRow}>
        <span style={styles.brandMark} aria-hidden>
          <Icon icon={SparklesIcon} size="sm" color="inherit" />
        </span>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Heading level={1}>Casewright</Heading>
            <Text type="supporting" color="secondary">
              Assistant · {FIRM_NAME}
            </Text>
          </HStack>
        </StackItem>
        <IconButton
          label="New thread"
          tooltip="New thread"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          variant="secondary"
          size="sm"
          onClick={() => {}}
        />
        <Avatar name={CURRENT_USER} size="small" />
      </HStack>
    </LayoutHeader>
  );

  const thread = (
    <ChatLayout composer={composer}>
      <ChatMessageList density="balanced">
        <ChatSystemMessage variant="divider">
          Wednesday, July 15
        </ChatSystemMessage>
        {/* ChatSystemMessage never wraps (nowrap content span) — keep this
            line short enough for the narrowest center column. */}
        <ChatSystemMessage>
          Thread scoped to M-2417 · linked M-2431 in scope
        </ChatSystemMessage>

        {/* Associate's query. */}
        <ChatMessage
          sender="user"
          avatar={<Avatar name={CURRENT_USER} size="small" />}>
          <ChatMessageBubble
            name={CURRENT_USER}
            metadata={
              <ChatMessageMetadata
                timestamp={
                  <Timestamp value="2026-07-15T10:24:00" format="time" />
                }
              />
            }>
            {USER_QUERY}
          </ChatMessageBubble>
        </ChatMessage>

        {/* Casewright: retrieval trace (subordinate) + structured answer. */}
        <ChatMessage
          sender="assistant"
          avatar={
            <span style={styles.aiAvatar} aria-hidden>
              <Icon icon={SparklesIcon} size="sm" color="inherit" />
            </span>
          }>
          <RetrievalTrace />
          <AnswerCard
            verifications={verifications}
            onVerify={verifyPoint}
            onCite={citeSource}
            onFollowUp={fillFollowUp}
          />
          <ChatMessageMetadata
            timestamp={
              <Timestamp value="2026-07-15T10:24:00" format="time" />
            }
          />
        </ChatMessage>

        {/* Messages sent from the composer this session. */}
        {sentMessages.map((message, index) => (
          <ChatMessage
            key={`sent-${index}`}
            sender="user"
            avatar={<Avatar name={CURRENT_USER} size="small" />}>
            <ChatMessageBubble
              name={CURRENT_USER}
              metadata={
                <ChatMessageMetadata>
                  <Text type="supporting" size="xsm" color="secondary">
                    Sent · awaiting Casewright
                  </Text>
                </ChatMessageMetadata>
              }>
              {message}
            </ChatMessageBubble>
          </ChatMessage>
        ))}
      </ChatMessageList>
    </ChatLayout>
  );

  return (
    <div style={styles.root}>
      <div style={styles.privilegeStrip}>
        <Icon icon={LockIcon} size="sm" color="secondary" />
        <Text type="supporting" size="xsm" color="secondary">
          Attorney-Client Privileged · Attorney Work Product — do not
          forward outside {FIRM_NAME}.
        </Text>
      </div>
      <div style={styles.layoutWrap}>
        <Layout
          height="fill"
          header={header}
          start={
            isCompact ? undefined : (
              <LayoutPanel
                width={280}
                padding={0}
                hasDivider
                label="Matter context">
                <MatterRail
                  activeMatterId={activeMatterId}
                  onSelectMatter={setActiveMatterId}
                  activeThreadId={activeThreadId}
                  onSelectThread={setActiveThreadId}
                />
              </LayoutPanel>
            )
          }
          content={
            <LayoutContent padding={0}>
              <div style={styles.chatColumn}>{thread}</div>
            </LayoutContent>
          }
          end={
            isNarrow ? undefined : (
              <LayoutPanel
                width={320}
                padding={0}
                hasDivider
                label="Cited sources">
                <SourcesPanel
                  activeSourceId={activeSourceId}
                  onSelectSource={citeSource}
                />
              </LayoutPanel>
            )
          }
        />
      </div>
    </div>
  );
}
