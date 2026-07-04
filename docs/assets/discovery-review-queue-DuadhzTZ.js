var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — two produced email-thread documents
 *   from the fictional matter M-2389 · Kestrel Labs, Inc. v. Corvid Metrics
 *   LLC (Bates KL0147233–37, custodians Elena Voss and Tom Okonkwo, fixed
 *   Feb–Apr 2026 strings), Casewright classifier suggestions with raw
 *   scores + confidence bands, a 5-tag issue list with batch counts, three
 *   session privilege-log entries, and a 200-doc seed-set calibration
 *   readout. No clocks, no Math.random, no network media.
 * @output Discovery Review Queue — Casewright's doc-by-doc coding console
 *   for a WIDE-scale email review at Marlow & Voss LLP: a batch progress
 *   header (doc 147 of 2,410 + compact ProgressBar, session pace stat,
 *   j/k/r/p keyboard hints, prev/next), a persistent privilege strip, a
 *   centered light-locked paper canvas rendering the email thread as a
 *   STATIC produced document (Bates stamp, message header blocks, serif
 *   body) with AI-highlighted hot passages (amber relevance / purple
 *   privilege washes with R1/P1 markers), and a right coding panel: an AI
 *   suggestions banner ("AI suggests: Relevant · 0.87 · High …") with
 *   passage citation chips, Accept/Override, and a disclosure line; a
 *   Relevant/Not relevant/Uncertain SegmentedControl; a privilege
 *   RadioList whose AC/WP choices reveal the auto-drafted privilege-log
 *   note; an issue-tag CheckboxList with batch counts; and a pinned
 *   Save & next bar. A footer pairs the seed-set precision/recall strip
 *   (honest ± error bars note) with a privilege-log preview drawer chip
 *   whose export demands an AlertDialog confirm.
 * @position Page template; emitted by \`astryx template discovery-review-queue\`.
 *   The document body is a STATIC produced-document preview by design —
 *   never a live editor; all interactivity belongs to the coding chrome.
 *
 * Frame: root 100dvh div > Layout height="fill". LayoutHeader = batch
 * progress toolbar + privilege strip. LayoutContent (padding 0) = muted
 * backdrop centering a 720px-max paper column. LayoutPanel end 380 =
 * coding panel (scrolling controls + pinned Save & next bar). LayoutFooter
 * = calibration strip + privilege-log drawer chip (drawer expands above
 * the footer row, in flow — no overlay clearance needed).
 *
 * Responsive contract:
 * - >1100px: full frame; panel 380 fixed; paper backdrop and panel scroll
 *   independently (minHeight: 0 down both chains).
 * - <=1100px: panel narrows to 320; keyboard hints leave the header.
 * - <=860px: the end panel is dropped and the coding controls stack below
 *   the paper inside the content scroller; header rows wrap (flexWrap);
 *   footer strip wraps and the drawer becomes full-width.
 *
 * Container policy (review-console archetype): frame rows and panels only
 * — the AI suggestions banner, auto-log note, calibration strip, and
 * privilege-log drawer are styled divs, not Cards; no Cards anywhere.
 *
 * Color policy: the paper canvas is deliberately scheme-locked light
 * (colorScheme: 'light') so the produced document reads as paper in both
 * schemes — PAPER_* literals and the relevance/privilege highlight washes
 * stay raw hex on that locked surface. The relevance-amber and
 * privilege-purple inks are light-dark() pairs: on locked paper they
 * resolve to their light halves; on app chrome (passage chips, markers in
 * the rail) they brighten for dark backgrounds. The AI-suggestion tint
 * uses the categorical purple with its repo-standard fallback pair.
 * Everything else is token-pure. Confidence renders as raw classifier
 * scores PLUS bands (TAR-standard), grounded by the seed-set calibration
 * strip and its explicit small-sample error-bars note — never as fake
 * "% confident" prose.
 *
 * Choose over expense-approval-queue when rows are discovery documents
 * coded on multiple axes (relevance, privilege, issue tags) rather than
 * expense reports receiving a single approve/reject verdict; choose over
 * it-access-requests when the judgment is evidentiary coding with AI
 * suggestions and a privilege log, not identity-policy access grants;
 * choose over doc-comments-review when the paper hosts classifier hot
 * passages feeding a coding panel, not threaded human comments.
 */

import {useEffect, useState, type CSSProperties, type ReactNode} from 'react';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  LockIcon,
  PencilLineIcon,
  ScaleIcon,
  SparklesIcon,
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
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= PAINT CONSTANTS =============
// Scheme-locked paper (see Color policy): literal light values, locked
// with colorScheme:'light' so highlight washes hold in dark mode.

const PAPER_BG = '#FFFFFF';
const PAPER_TEXT = '#1F2A37';
const PAPER_MUTED = '#6B7280';
const PAPER_RULE = '#E5E7EB';
const PAPER_STAMP = '#B91C1C'; // confidentiality stamp ink, paper-only

// Relevance-hot amber: wash is paper-only literal; ink pairs brighten on
// app chrome (markers, citation chips).
const REL_WASH = '#FBEFC9';
const REL_WASH_ACTIVE = '#F6E09A';
const REL_INK = 'light-dark(#9A6700, #E3B341)';

// Privilege-hot purple: same split.
const PRIV_WASH = '#EDE9FE';
const PRIV_WASH_ACTIVE = '#DDD3FC';
const PRIV_INK = 'light-dark(#6D28D9, #B197FC)';

// AI-suggestion tint (categorical purple, repo-standard fallback pair).
const AI_ACCENT = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';

const SERIF = "Georgia, 'Times New Roman', Times, serif";
const MONO = 'var(--font-family-code, monospace)';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  fill: {height: '100%', minHeight: 0},
  headerBar: {
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  headerProgress: {minWidth: 120, width: '100%'},
  paceText: {fontFamily: MONO, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  privilegeStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-4)',
    backgroundColor: 'light-dark(#FDECEC, #3B1D1F)',
    color: 'light-dark(#8F1D22, #F1A9AD)',
    borderBottom: 'var(--border-width) solid light-dark(#F3C6C8, #5A2A2E)',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  // Muted backdrop; paper column centers, backdrop scrolls.
  backdrop: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  paperColumn: {width: '100%', maxWidth: 720, marginInline: 'auto'},
  paper: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    padding: 'clamp(24px, 5vw, 48px)',
  },
  batesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: '0.06em',
    color: PAPER_MUTED,
    textTransform: 'uppercase',
  },
  stamp: {color: PAPER_STAMP, fontWeight: 700},
  docTitle: {fontFamily: SERIF, fontSize: 22, fontWeight: 700, lineHeight: 1.3, margin: '18px 0 4px'},
  docMeta: {fontSize: 12.5, color: PAPER_MUTED, lineHeight: 1.6},
  msgRule: {border: 'none', borderTop: \`1px solid \${PAPER_RULE}\`, margin: '22px 0 16px'},
  msgHeader: {
    display: 'grid',
    gridTemplateColumns: '58px 1fr',
    rowGap: 3,
    columnGap: 10,
    fontSize: 12.5,
    lineHeight: 1.5,
    marginBottom: 12,
  },
  msgLabel: {color: PAPER_MUTED, fontWeight: 600},
  msgValue: {color: PAPER_TEXT, overflowWrap: 'break-word'},
  msgPara: {fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.8, margin: '0 0 14px', overflowWrap: 'break-word'},
  // Hot passages are inline <span role="button">s (keyboard reachable via
  // tabIndex + Enter/Space) — real <button>s never fragment across line
  // boxes, which shoved long passages onto their own block-looking lines
  // and orphaned the trailing punctuation. boxDecorationBreak:'clone'
  // repeats the wash + underline on every wrapped fragment.
  inlineButton: {
    display: 'inline',
    padding: '1px 2px',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    borderRadius: 3,
    WebkitBoxDecorationBreak: 'clone',
    boxDecorationBreak: 'clone',
  },
  relWash: {backgroundColor: REL_WASH, boxShadow: \`inset 0 -2px 0 \${REL_INK}\`},
  relWashActive: {backgroundColor: REL_WASH_ACTIVE, boxShadow: 'inset 0 0 0 1.5px #B45309'},
  privWash: {backgroundColor: PRIV_WASH, boxShadow: \`inset 0 -2px 0 \${PRIV_INK}\`},
  privWashActive: {backgroundColor: PRIV_WASH_ACTIVE, boxShadow: 'inset 0 0 0 1.5px #6D28D9'},
  passageMark: {
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: 700,
    verticalAlign: 'super',
    marginLeft: 2,
    letterSpacing: '0.04em',
  },
  paperFootnote: {
    marginTop: 26,
    paddingTop: 12,
    borderTop: \`1px solid \${PAPER_RULE}\`,
    fontSize: 11.5,
    color: PAPER_MUTED,
    lineHeight: 1.6,
  },
  // ---- coding panel ----
  panelColumn: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  panelScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  panelSaveBar: {
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  aiBanner: {
    borderRadius: 'var(--radius-container)',
    border: \`var(--border-width) solid \${AI_ACCENT}\`,
    backgroundColor: 'light-dark(rgba(107,30,253,0.06), rgba(157,107,255,0.12))',
    padding: 'var(--spacing-3)',
  },
  aiReceipt: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  scoreText: {fontFamily: MONO, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  passageChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    font: 'inherit',
    fontSize: 12,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  passageChipActive: {boxShadow: 'inset 0 0 0 1px var(--color-accent)', borderColor: 'var(--color-accent)'},
  chipMark: {fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0},
  rationaleBox: {borderInlineStart: \`2px solid \${AI_ACCENT}\`, paddingInlineStart: 'var(--spacing-2)'},
  autoLogNote: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid light-dark(#DDD3FC, #4C3A78)',
    backgroundColor: 'light-dark(#F6F3FE, #2A2140)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  logQuote: {fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.6},
  // ---- footer ----
  footerBar: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  calibText: {fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 11.5, whiteSpace: 'nowrap'},
  drawer: {
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    maxHeight: 260,
    overflowY: 'auto',
  },
  // Two-line log rows (meta strip + full-width description) — a single
  // wrapping flex row stranded the verify token and provenance on ragged
  // extra lines at desktop widths.
  logRow: {padding: 'var(--spacing-2) 0'},
  logBates: {fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0},
  stackedPanel: {
    marginTop: 'var(--spacing-4)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-4)',
  },
};

// ============= FIXTURES =============
// Matter M-2389 · Kestrel Labs, Inc. v. Corvid Metrics LLC — a commercial
// dispute over a contested "data-migration surcharge" and a withheld data
// export under the (fictional) Corvid Metrics MSA. Lead: Julian Voss;
// reviewer: David Chen; privilege-log QC: Ruth Vega. All fixed strings.

type PassageKind = 'relevance' | 'privilege';

interface HotPassage {
  id: string;
  marker: string; // R1 / P1
  kind: PassageKind;
  where: string; // "Msg 1"
  rationale: string;
}

/** A body segment: plain text, or a hot-passage span keyed by passage id. */
type Seg = string | {t: string; p: string};

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  cc?: string;
  sent: string;
  subject: string;
  paras: Seg[][];
}

interface AiAxis {
  label: string;
  score: string; // raw classifier score, e.g. "0.87"
  band: 'High' | 'Medium' | 'Low';
  bandColor: 'green' | 'yellow' | 'gray';
  passageIds: string[];
}

interface ReviewDoc {
  id: string;
  number: number; // position in batch
  bates: string;
  custodian: string;
  title: string;
  collected: string;
  source: string;
  messages: EmailMessage[];
  passages: HotPassage[];
  ai: {
    relevance: AiAxis;
    privilege: AiAxis;
    suggestRelevance: string;
    suggestPrivilege: string;
    suggestTags: string[];
    caution: string;
  };
  autoLog: string; // Casewright-drafted privilege-log description
}

const DOC_147: ReviewDoc = {
  id: 'DOC-0147',
  number: 147,
  bates: 'KL0147233–KL0147235',
  custodian: 'Elena Voss (Kestrel Labs — Finance)',
  title: 'RE: Q1 true-up — migration surcharge (Invoice CM-8841)',
  collected: 'Collected Apr 22, 2026 · M365 mailbox export',
  source: 'Family KL0147233–37 (parent + attachment placeholder)',
  messages: [
    {
      id: 'm1',
      from: 'Marcus Hale <m.hale@corvidmetrics.com> (Corvid Metrics · VP, Accounts)',
      to: 'Elena Voss <e.voss@kestrellabs.com>',
      sent: 'Tue, Feb 24, 2026 · 9:41 AM ET',
      subject: 'Q1 true-up — migration surcharge (Invoice CM-8841)',
      paras: [
        [
          'Elena — attached is invoice CM-8841 covering the Q1 usage true-up. Metered analytics calls came in at 41.2M against your 30M commitment, so the overage line is $63,400 at the contracted rate.',
        ],
        [
          'Separately, since Kestrel has noticed termination effective March 31, ',
          {
            t: 'per §4.2 of the MSA a one-time data-migration surcharge of $184,000 applies to termination-time exports above 5 TB',
            p: 'r1',
          },
          '. That line also appears on CM-8841.',
        ],
        [
          'Note that ',
          {
            t: 'export credentials will be issued once the surcharge invoice clears',
            p: 'r2',
          },
          ' — our standard practice for off-boarding accounts with an open balance.',
        ],
      ],
    },
    {
      id: 'm2',
      from: 'Elena Voss <e.voss@kestrellabs.com>',
      to: 'Marcus Hale <m.hale@corvidmetrics.com>',
      cc: 'Tom Okonkwo <t.okonkwo@kestrellabs.com>',
      sent: 'Tue, Feb 24, 2026 · 4:07 PM ET',
      subject: 'RE: Q1 true-up — migration surcharge (Invoice CM-8841)',
      paras: [
        [
          'Marcus — we will pay the metered overage once Tom reconciles the call counts. The surcharge is a different matter: ',
          {
            t: "nothing in §4.2 authorizes a 'migration surcharge' — §4.2 caps termination-assistance fees at documented cost, and our export is 3.8 TB in any case",
            p: 'r3',
          },
          ', under your own 5 TB threshold.',
        ],
        [
          'Please remove the $184,000 line and reissue. Tom (copied) will confirm the export size from the admin console this week.',
        ],
      ],
    },
    {
      id: 'm3',
      from: 'Elena Voss <e.voss@kestrellabs.com>',
      to: 'Julian Voss <jvoss@marlowvoss.com> (Marlow & Voss LLP)',
      sent: 'Wed, Feb 25, 2026 · 8:12 AM ET',
      subject: 'FWD: Q1 true-up — migration surcharge (Invoice CM-8841)',
      paras: [
        [
          {
            t: 'Julian — forwarding the thread below for legal advice. Can Corvid withhold our data export until we pay a surcharge the contract does not mention? The Atlas cutover depends on that data landing by mid-March',
            p: 'p1',
          },
          '. Happy to get on a call with Tom if useful. — Elena',
        ],
      ],
    },
  ],
  passages: [
    {
      id: 'r1',
      marker: 'R1',
      kind: 'relevance',
      where: 'Msg 1',
      rationale: "Asserts a §4.2 basis for the contested $184,000 'migration surcharge' — core to Count I (breach).",
    },
    {
      id: 'r2',
      marker: 'R2',
      kind: 'relevance',
      where: 'Msg 1',
      rationale: 'States that export credentials are conditioned on paying the surcharge — the withholding conduct at issue.',
    },
    {
      id: 'r3',
      marker: 'R3',
      kind: 'relevance',
      where: 'Msg 2',
      rationale: 'Kestrel disputes the §4.2 reading and the 5 TB threshold — direct evidence of the contract-interpretation dispute.',
    },
    {
      id: 'p1',
      marker: 'P1',
      kind: 'privilege',
      where: 'Msg 3',
      rationale: 'Client forwards the thread to outside counsel expressly "for legal advice" — attorney–client privilege signals; only Msg 3 appears privileged.',
    },
  ],
  ai: {
    relevance: {label: 'Relevant', score: '0.87', band: 'High', bandColor: 'green', passageIds: ['r1', 'r2', 'r3']},
    privilege: {label: 'Privileged', score: '0.62', band: 'Medium', bandColor: 'yellow', passageIds: ['p1']},
    suggestRelevance: 'relevant',
    suggestPrivilege: 'ac',
    suggestTags: ['surcharge', 'export', 'legal-advice'],
    caution:
      'Privilege signal is partial — only Msg 3 (client → outside counsel) scores privileged. Consider withhold-in-part.',
  },
  autoLog:
    'Email from E. Voss (Kestrel Labs) to J. Voss (Marlow & Voss LLP) requesting legal advice regarding contractual data-export obligations and a disputed migration surcharge. Withheld in part — message 3 of 3.',
};

const DOC_148: ReviewDoc = {
  id: 'DOC-0148',
  number: 148,
  bates: 'KL0147236–KL0147237',
  custodian: 'Tom Okonkwo (Kestrel Labs — IT)',
  title: 'RE: Export credentials — SFTP access suspended',
  collected: 'Collected Apr 22, 2026 · M365 mailbox export',
  source: 'Standalone (no family members)',
  messages: [
    {
      id: 'm1',
      from: 'Dana Reyes <support@corvidmetrics.com> (Corvid Metrics · Support)',
      to: 'Tom Okonkwo <t.okonkwo@kestrellabs.com>',
      sent: 'Mon, Mar 2, 2026 · 11:05 AM ET',
      subject: 'Export credentials — SFTP access',
      paras: [
        [
          'Hi Tom — ticket #48112. ',
          {
            t: 'The SFTP export credentials for the kestrel-prod workspace are suspended per an accounts hold on your organization',
            p: 'r4',
          },
          '. Support cannot lift the hold; please contact your account representative.',
        ],
      ],
    },
    {
      id: 'm2',
      from: 'Tom Okonkwo <t.okonkwo@kestrellabs.com>',
      to: 'Dana Reyes <support@corvidmetrics.com>',
      cc: 'Elena Voss <e.voss@kestrellabs.com>',
      sent: 'Mon, Mar 2, 2026 · 2:31 PM ET',
      subject: 'RE: Export credentials — SFTP access',
      paras: [
        [
          'Dana — for the record, ',
          {
            t: 'the full export is 3.8 TB as measured in the admin console on Feb 27, and the suspension is blocking a contractually required termination export',
            p: 'r5',
          },
          '. Reopening the ticket and copying Elena Voss on our side.',
        ],
      ],
    },
  ],
  passages: [
    {
      id: 'r4',
      marker: 'R1',
      kind: 'relevance',
      where: 'Msg 1',
      rationale: "Confirms Corvid suspended export credentials citing an 'accounts hold' — the withholding conduct, from Corvid's own support channel.",
    },
    {
      id: 'r5',
      marker: 'R2',
      kind: 'relevance',
      where: 'Msg 2',
      rationale: 'Contemporaneous 3.8 TB measurement — rebuts the 5 TB surcharge threshold asserted in KL0147233.',
    },
  ],
  ai: {
    relevance: {label: 'Relevant', score: '0.91', band: 'High', bandColor: 'green', passageIds: ['r4', 'r5']},
    privilege: {label: 'Privileged', score: '0.08', band: 'Low', bandColor: 'gray', passageIds: []},
    suggestRelevance: 'relevant',
    suggestPrivilege: 'none',
    suggestTags: ['export'],
    caution: 'No privilege signals — no counsel on the thread.',
  },
  autoLog:
    'Support thread between T. Okonkwo (Kestrel Labs) and Corvid Metrics support regarding suspended export credentials. No counsel on thread.',
};

const DOCS: ReviewDoc[] = [DOC_147, DOC_148];

const BATCH_TOTAL = '2,410';
const SESSION_BASE_CODED = 42;

interface IssueTag {
  id: string;
  label: string;
  count: number; // times applied across the batch so far
}

const ISSUE_TAGS: IssueTag[] = [
  {id: 'surcharge', label: 'Migration surcharge (§4.2)', count: 118},
  {id: 'export', label: 'Data export & withholding', count: 96},
  {id: 'termination', label: 'Termination & wind-down', count: 61},
  {id: 'performance', label: 'Corvid performance issues', count: 43},
  {id: 'legal-advice', label: 'Legal advice sought', count: 12},
];

type VerifyState = 'verified' | 'unverified';

interface LogEntry {
  id: string;
  doc: string;
  bates: string;
  basis: 'AC' | 'WP';
  description: string;
  verify: VerifyState;
  provenance: string;
}

const SESSION_LOG: LogEntry[] = [
  {
    id: 'pl1',
    doc: 'DOC-0132',
    bates: 'KL0146502',
    basis: 'AC',
    description: 'Email from E. Voss (Kestrel Labs) to J. Voss (Marlow & Voss LLP) requesting legal advice regarding the Corvid termination notice.',
    verify: 'verified',
    provenance: 'Verified · R. Vega · Jul 15, 10:52 AM',
  },
  {
    id: 'pl2',
    doc: 'DOC-0138',
    bates: 'KL0146811–12',
    basis: 'AC',
    description: 'Thread between P. Raman (Kestrel Labs) and J. Voss (Marlow & Voss LLP) regarding the Corvid source-code escrow demand.',
    verify: 'verified',
    provenance: 'Verified · R. Vega · Jul 15, 11:04 AM',
  },
  {
    id: 'pl3',
    doc: 'DOC-0143',
    bates: 'KL0147101',
    basis: 'WP',
    description: 'Draft timeline of Corvid service outages prepared by T. Okonkwo at the direction of counsel in anticipation of litigation.',
    verify: 'unverified',
    provenance: 'Not yet checked against source · pending R. Vega QC',
  },
];

// Seed-set calibration — fixed strings, rendered verbatim (honest error
// bars; never recomputed, never faked as live metrics).
const CALIB_RELEVANCE = 'Relevance precision 0.84 ±0.05 · recall 0.79 ±0.06';
const CALIB_PRIVILEGE = 'Privilege precision 0.71 ±0.08 · recall 0.88 ±0.05';
const CALIB_CONTEXT =
  'Seed set · 200 docs hand-coded (D. Chen), QC R. Vega · Jul 12';
const CALIB_NOTE =
  '± ranges are 95% intervals on a 200-doc sample — small-sample estimates. Expect drift as custodians broaden; recalibration scheduled at doc 500.';

// ============= CODING STATE =============

type Relevance = '' | 'relevant' | 'not-relevant' | 'uncertain';
type Privilege = '' | 'none' | 'ac' | 'wp';
type AiDisposition = 'pending' | 'accepted' | 'set-aside';

interface Coding {
  relevance: Relevance;
  privilege: Privilege;
  tags: string[];
  ai: AiDisposition;
  saved: boolean;
}

const EMPTY_CODING: Coding = {
  relevance: '',
  privilege: '',
  tags: [],
  ai: 'pending',
  saved: false,
};

// ============= SHARED PIECES =============

/** The suite-wide AI disclosure line — one treatment everywhere. */
function DisclosureLine() {
  return (
    <HStack gap={1} vAlign="center">
      <Icon icon={SparklesIcon} size="xsm" color="secondary" />
      <Text type="supporting" color="secondary">
        AI-generated · verify before relying
      </Text>
    </HStack>
  );
}

const BAND_TOKEN_COLOR = {green: 'green', yellow: 'yellow', gray: 'gray'} as const;

function AxisScore({axis}: {axis: AiAxis}) {
  return (
    <HStack gap={1} vAlign="center" wrap="wrap">
      <Text type="body" weight="semibold">
        {axis.label}
      </Text>
      <Text type="body" style={styles.scoreText}>
        · {axis.score}
      </Text>
      <Token size="sm" color={BAND_TOKEN_COLOR[axis.bandColor]} label={\`\${axis.band} confidence\`} style={{flexShrink: 0}} />
    </HStack>
  );
}

// ============= DOCUMENT PAPER =============

interface PaperProps {
  doc: ReviewDoc;
  activePassageId: string | null;
  onPassageSelect: (id: string) => void;
}

function passageStyle(kind: PassageKind, isActive: boolean): CSSProperties {
  if (kind === 'relevance') {
    return isActive
      ? {...styles.inlineButton, ...styles.relWash, ...styles.relWashActive}
      : {...styles.inlineButton, ...styles.relWash};
  }
  return isActive
    ? {...styles.inlineButton, ...styles.privWash, ...styles.privWashActive}
    : {...styles.inlineButton, ...styles.privWash};
}

function DocumentPaper({doc, activePassageId, onPassageSelect}: PaperProps) {
  const passageById = new Map(doc.passages.map(p => [p.id, p]));
  const renderSeg = (seg: Seg, key: number): ReactNode => {
    if (typeof seg === 'string') {
      return <span key={key}>{seg}</span>;
    }
    const passage = passageById.get(seg.p);
    if (passage === undefined) {
      return <span key={key}>{seg.t}</span>;
    }
    const isActive = activePassageId === passage.id;
    const ink = passage.kind === 'relevance' ? REL_INK : PRIV_INK;
    return (
      <span
        key={key}
        role="button"
        tabIndex={0}
        style={passageStyle(passage.kind, isActive)}
        aria-pressed={isActive}
        aria-label={\`Hot passage \${passage.marker} (\${passage.kind}): \${passage.rationale}\`}
        onClick={() => onPassageSelect(passage.id)}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onPassageSelect(passage.id);
          }
        }}>
        {seg.t}
        <span aria-hidden style={{...styles.passageMark, color: ink}}>
          {passage.marker}
        </span>
      </span>
    );
  };

  return (
    <div style={styles.paper}>
      <div style={styles.batesRow}>
        <span>{doc.bates}</span>
        <span style={styles.stamp}>
          Confidential — subject to protective order
        </span>
      </div>
      <p style={styles.docTitle}>{doc.title}</p>
      <div style={styles.docMeta}>
        Custodian: {doc.custodian} · {doc.collected}
        <br />
        {doc.source}
      </div>
      {doc.messages.map((msg, msgIndex) => (
        <div key={msg.id}>
          <hr style={styles.msgRule} />
          <div style={styles.msgHeader}>
            <span style={styles.msgLabel}>From</span>
            <span style={styles.msgValue}>{msg.from}</span>
            <span style={styles.msgLabel}>Sent</span>
            <span style={styles.msgValue}>{msg.sent}</span>
            <span style={styles.msgLabel}>To</span>
            <span style={styles.msgValue}>{msg.to}</span>
            {msg.cc !== undefined ? (
              <>
                <span style={styles.msgLabel}>Cc</span>
                <span style={styles.msgValue}>{msg.cc}</span>
              </>
            ) : null}
            <span style={styles.msgLabel}>Subject</span>
            <span style={styles.msgValue}>
              {msg.subject}
              <span style={{color: PAPER_MUTED}}>
                {' '}
                · Message {msgIndex + 1} of {doc.messages.length}
              </span>
            </span>
          </div>
          {msg.paras.map((para, paraIndex) => (
            <p key={paraIndex} style={styles.msgPara}>
              {para.map(renderSeg)}
            </p>
          ))}
        </div>
      ))}
      <div style={styles.paperFootnote}>
        Produced from the mailbox of {doc.custodian.split(' (')[0]} · Kestrel
        Labs, Inc. v. Corvid Metrics LLC, No. 26-cv-3184 (S.D.N.Y.) · Bates{' '}
        {doc.bates}. Highlights are Casewright classifier output — they are
        not part of the produced document.
      </div>
    </div>
  );
}

// ============= AI SUGGESTIONS BANNER =============

interface AiBannerProps {
  doc: ReviewDoc;
  coding: Coding;
  activePassageId: string | null;
  onPassageSelect: (id: string) => void;
  onAccept: () => void;
  onSetAside: () => void;
}

function AiSuggestionsBanner({
  doc,
  coding,
  activePassageId,
  onPassageSelect,
  onAccept,
  onSetAside,
}: AiBannerProps) {
  if (coding.ai === 'accepted') {
    return (
      <div style={styles.aiReceipt}>
        <VStack gap={1}>
          <Text type="body" weight="semibold">
            Suggestions applied — verify coding before saving
          </Text>
          <Text type="supporting" color="secondary">
            Acceptance is recorded in the Casewright AI usage log with this
            document's Bates range.
          </Text>
        </VStack>
      </div>
    );
  }
  if (coding.ai === 'set-aside') {
    return (
      <div style={styles.aiReceipt}>
        <VStack gap={1}>
          <Text type="body" weight="semibold">
            AI suggestions set aside — coding manually
          </Text>
          <Text type="supporting" color="secondary">
            The override is recorded in the AI usage log; the classifier
            learns from your final coding.
          </Text>
        </VStack>
      </div>
    );
  }

  const activePassage =
    activePassageId !== null
      ? doc.passages.find(p => p.id === activePassageId) ?? null
      : null;

  return (
    <div style={styles.aiBanner}>
      <VStack gap={2}>
        <HStack gap={1} vAlign="center">
          <Icon icon={SparklesIcon} size="sm" color="secondary" />
          <Text type="body" weight="semibold">
            AI suggests
          </Text>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" style={{flexShrink: 0}}>
            review carefully
          </Text>
        </HStack>
        <AxisScore axis={doc.ai.relevance} />
        <AxisScore axis={doc.ai.privilege} />
        <Text type="supporting" color="secondary">
          {doc.ai.caution}
        </Text>
        <HStack gap={1} wrap="wrap">
          {doc.passages.map(p => {
            const isActive = activePassageId === p.id;
            const ink = p.kind === 'relevance' ? REL_INK : PRIV_INK;
            const chipStyle = isActive
              ? {...styles.passageChip, ...styles.passageChipActive}
              : styles.passageChip;
            return (
              <button
                key={p.id}
                type="button"
                style={chipStyle}
                aria-pressed={isActive}
                onClick={() => onPassageSelect(p.id)}>
                <span style={{...styles.chipMark, color: ink}}>{p.marker}</span>
                <Text type="supporting" color="secondary">
                  {p.where}
                </Text>
              </button>
            );
          })}
        </HStack>
        {activePassage !== null ? (
          <div style={styles.rationaleBox}>
            <Text type="supporting" color="secondary">
              {activePassage.marker} · {activePassage.where} —{' '}
              {activePassage.rationale}
            </Text>
          </div>
        ) : (
          <Text type="supporting" color="secondary">
            Select a passage chip to see the classifier's rationale and jump
            to the highlight.
          </Text>
        )}
        <HStack gap={2} wrap="wrap">
          <Button label="Accept suggestions" size="sm" variant="primary" onClick={onAccept} />
          <Button label="Override — code manually" size="sm" variant="secondary" onClick={onSetAside} />
        </HStack>
        <DisclosureLine />
      </VStack>
    </div>
  );
}

// ============= AUTO-DRAFTED PRIVILEGE-LOG NOTE =============

function AutoLogNote({doc, basis}: {doc: ReviewDoc; basis: Privilege}) {
  return (
    <div style={styles.autoLogNote}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Text type="body" weight="semibold">
            Auto-drafted privilege-log entry
          </Text>
          <Token size="sm" color="yellow" label="Unverified" style={{flexShrink: 0}} />
        </HStack>
        <Text type="body" style={styles.logQuote}>
          “{doc.autoLog}”
        </Text>
        <Text type="supporting" color="secondary">
          Basis:{' '}
          {basis === 'wp' ? 'Attorney work product' : 'Attorney–client privilege'}{' '}
          · added to the privilege-log preview below · pending R. Vega QC.
        </Text>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button label="Edit entry" size="sm" variant="secondary" icon={<Icon icon={PencilLineIcon} size="sm" />} />
          <DisclosureLine />
        </HStack>
      </VStack>
    </div>
  );
}

// ============= CODING PANEL =============

interface CodingBodyProps extends AiBannerProps {
  onCodingChange: (patch: Partial<Coding>) => void;
}

function CodingPanelBody({
  doc,
  coding,
  activePassageId,
  onPassageSelect,
  onAccept,
  onSetAside,
  onCodingChange,
}: CodingBodyProps) {
  return (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Text type="body" weight="semibold">
          Coding · {doc.id}
        </Text>
        <StackItem size="fill" />
        {coding.saved ? (
          <Token size="sm" color="green" label="Saved" style={{flexShrink: 0}} />
        ) : (
          <Token size="sm" color="gray" label="Uncoded" style={{flexShrink: 0}} />
        )}
      </HStack>

      <AiSuggestionsBanner
        doc={doc}
        coding={coding}
        activePassageId={activePassageId}
        onPassageSelect={onPassageSelect}
        onAccept={onAccept}
        onSetAside={onSetAside}
      />

      <Divider />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Text type="body" weight="semibold">
            Relevance
          </Text>
          <StackItem size="fill" />
          <Kbd keys="r" />
        </HStack>
        <SegmentedControl
          label="Relevance"
          size="sm"
          value={coding.relevance}
          onChange={value =>
            onCodingChange({relevance: value as Relevance})
          }>
          <SegmentedControlItem label="Relevant" value="relevant" />
          <SegmentedControlItem label="Not relevant" value="not-relevant" />
          <SegmentedControlItem label="Uncertain" value="uncertain" />
        </SegmentedControl>
      </VStack>

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Text type="body" weight="semibold">
            Privilege
          </Text>
          <StackItem size="fill" />
          <Kbd keys="p" />
        </HStack>
        <RadioList
          label="Privilege"
          isLabelHidden
          value={coding.privilege}
          onChange={value =>
            onCodingChange({privilege: value as Privilege})
          }>
          <RadioListItem label="No privilege" value="none" />
          <RadioListItem
            label="Attorney–client privilege"
            value="ac"
            description="Confidential communication seeking or giving legal advice"
          />
          <RadioListItem
            label="Attorney work product"
            value="wp"
            description="Prepared in anticipation of litigation"
          />
        </RadioList>
        {coding.privilege === 'ac' || coding.privilege === 'wp' ? (
          <AutoLogNote doc={doc} basis={coding.privilege} />
        ) : null}
      </VStack>

      <VStack gap={2}>
        <Text type="body" weight="semibold">
          Issue tags
        </Text>
        <CheckboxList
          label="Issue tags"
          isLabelHidden
          value={coding.tags}
          onChange={tags => onCodingChange({tags})}
          density="compact">
          {ISSUE_TAGS.map(tag => (
            <CheckboxListItem
              key={tag.id}
              value={tag.id}
              label={tag.label}
              endContent={<Badge label={String(tag.count)} />}
            />
          ))}
        </CheckboxList>
        <Text type="supporting" color="secondary">
          Counts are batch-wide applications so far (docs 1–146).
        </Text>
      </VStack>
    </VStack>
  );
}

interface SaveBarProps {
  coding: Coding;
  hasNext: boolean;
  onSave: () => void;
}

function SaveBar({coding, hasNext, onSave}: SaveBarProps) {
  const isCodable = coding.relevance !== '' && coding.privilege !== '';
  return (
    <VStack gap={1}>
      <Button
        label={hasNext ? 'Save & next' : 'Save — end of batch page'}
        variant="primary"
        isDisabled={!isCodable || coding.saved}
        onClick={onSave}
        style={{width: '100%'}}
      />
      <Text type="supporting" color="secondary">
        {isCodable
          ? 'Saving records your coding and the AI disposition to the audit trail.'
          : 'Code relevance and privilege to enable saving.'}
      </Text>
    </VStack>
  );
}

// ============= HEADER =============

interface HeaderProps {
  docNumber: number;
  sessionCoded: number;
  showKbdHints: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function ReviewHeader({
  docNumber,
  sessionCoded,
  showKbdHints,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: HeaderProps) {
  return (
    <div>
      <div style={styles.headerBar}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Icon icon={ScaleIcon} size="md" color="secondary" />
          <VStack gap={0}>
            <Heading level={1}>Discovery Review</Heading>
            <Text type="supporting" color="secondary">
              Casewright · M-2389 · Kestrel Labs, Inc. v. Corvid Metrics LLC
              · Batch B-14 — Corvid email custodians
            </Text>
          </VStack>
          <StackItem size="fill" />
          <VStack gap={1} hAlign="end">
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="secondary" style={styles.paceText}>
                Doc {docNumber} of {BATCH_TOTAL}
              </Text>
              <Tooltip content="Pace over the last hour · session started 10:05 AM">
                <Text type="supporting" color="secondary" style={styles.paceText}>
                  · {sessionCoded} coded this session · 51 docs/hr
                </Text>
              </Tooltip>
            </HStack>
            <ProgressBar
              label={\`Batch progress: document \${docNumber} of \${BATCH_TOTAL}\`}
              isLabelHidden
              value={docNumber}
              max={2410}
              style={styles.headerProgress}
            />
          </VStack>
          {showKbdHints ? (
            <HStack gap={1} vAlign="center">
              <Kbd keys="j" />
              <Kbd keys="k" />
              <Text type="supporting" color="secondary">
                doc
              </Text>
              <Kbd keys="r" />
              <Text type="supporting" color="secondary">
                relevant
              </Text>
              <Kbd keys="p" />
              <Text type="supporting" color="secondary">
                privilege
              </Text>
            </HStack>
          ) : null}
          <HStack gap={1} vAlign="center">
            <IconButton
              label="Previous document (k)"
              icon={<Icon icon={ChevronLeftIcon} size="sm" />}
              variant="ghost"
              size="sm"
              isDisabled={!canPrev}
              onClick={onPrev}
            />
            <IconButton
              label="Next document (j)"
              icon={<Icon icon={ChevronRightIcon} size="sm" />}
              variant="ghost"
              size="sm"
              isDisabled={!canNext}
              onClick={onNext}
            />
          </HStack>
          <Tooltip content="Reviewing as David Chen · QC: Ruth Vega">
            <Avatar name="David Chen" size="small" />
          </Tooltip>
        </HStack>
      </div>
      <div style={styles.privilegeStrip}>
        <Icon icon={LockIcon} size="xsm" color="inherit" />
        <span>
          Attorney-Client Privileged · Attorney Work Product — do not forward
          outside Marlow &amp; Voss LLP
        </span>
      </div>
    </div>
  );
}

// ============= FOOTER: CALIBRATION STRIP + PRIVILEGE-LOG DRAWER =============

interface FooterProps {
  logEntries: LogEntry[];
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onExport: () => void;
}

function ReviewFooter({
  logEntries,
  isDrawerOpen,
  onToggleDrawer,
  onExport,
}: FooterProps) {
  return (
    <div>
      {isDrawerOpen ? (
        <div style={styles.drawer}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Text type="body" weight="semibold">
                Privilege log — session preview
              </Text>
              <Token size="sm" color="gray" label={\`\${logEntries.length} entries\`} style={{flexShrink: 0}} />
              <StackItem size="fill" />
              <Button
                label="Export log…"
                size="sm"
                variant="secondary"
                icon={<Icon icon={DownloadIcon} size="sm" />}
                onClick={onExport}
              />
            </HStack>
            <Text type="supporting" color="secondary">
              Entries drafted by Casewright from coding decisions · QC owner
              Ruth Vega · descriptions are AI-generated — verify before
              relying.
            </Text>
            <Divider />
            {logEntries.map(entry => (
              <div key={entry.id} style={styles.logRow}>
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <span style={styles.logBates}>
                      {entry.doc} · {entry.bates}
                    </span>
                    <Token
                      size="sm"
                      color={entry.basis === 'AC' ? 'purple' : 'blue'}
                      label={entry.basis === 'AC' ? 'Attorney–client' : 'Work product'}
                      style={{flexShrink: 0}}
                    />
                    <Token
                      size="sm"
                      color={entry.verify === 'verified' ? 'green' : 'yellow'}
                      label={entry.verify === 'verified' ? 'Verified' : 'Unverified'}
                      style={{flexShrink: 0}}
                    />
                    <StackItem size="fill" />
                    <Text type="supporting" color="secondary">
                      {entry.provenance}
                    </Text>
                  </HStack>
                  <Text type="supporting">{entry.description}</Text>
                </VStack>
              </div>
            ))}
          </VStack>
        </div>
      ) : null}
      <div style={styles.footerBar}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Text type="supporting" weight="semibold" style={{flexShrink: 0}}>
            Model calibration
          </Text>
          <Text type="supporting" color="secondary" style={styles.calibText}>
            {CALIB_RELEVANCE}
          </Text>
          <Text type="supporting" color="secondary" style={styles.calibText}>
            {CALIB_PRIVILEGE}
          </Text>
          <Text type="supporting" color="secondary">
            {CALIB_CONTEXT}. {CALIB_NOTE}
          </Text>
          <StackItem size="fill" />
          <Button
            label={\`Privilege log · \${logEntries.length} entries\`}
            size="sm"
            variant={isDrawerOpen ? 'primary' : 'secondary'}
            icon={<Icon icon={LockIcon} size="sm" />}
            onClick={onToggleDrawer}
          />
        </HStack>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function DiscoveryReviewQueueTemplate() {
  const isPanelNarrow = useMediaQuery('(max-width: 1100px)');
  const isStacked = useMediaQuery('(max-width: 860px)');

  const [docIndex, setDocIndex] = useState(0);
  const [codingById, setCodingById] = useState<Record<string, Coding>>({});
  const [activePassageId, setActivePassageId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const doc = DOCS[docIndex];
  const coding = codingById[doc.id] ?? EMPTY_CODING;

  const patchCoding = (docId: string, patch: Partial<Coding>) => {
    setCodingById(prev => ({
      ...prev,
      [docId]: {...(prev[docId] ?? EMPTY_CODING), ...patch},
    }));
  };

  const goTo = (index: number) => {
    if (index >= 0 && index < DOCS.length && index !== docIndex) {
      setDocIndex(index);
      setActivePassageId(null);
    }
  };

  const togglePassage = (id: string) => {
    setActivePassageId(prev => (prev === id ? null : id));
  };

  const acceptSuggestions = () => {
    const mergedTags = Array.from(
      new Set([...coding.tags, ...doc.ai.suggestTags]),
    );
    patchCoding(doc.id, {
      relevance: doc.ai.suggestRelevance as Relevance,
      privilege: doc.ai.suggestPrivilege as Privilege,
      tags: mergedTags,
      ai: 'accepted',
    });
  };

  const setAsideSuggestions = () => {
    patchCoding(doc.id, {ai: 'set-aside'});
  };

  const saveAndNext = () => {
    patchCoding(doc.id, {saved: true});
    goTo(docIndex + 1);
  };

  // j/k/r/p — the header hints are real. Ignored while typing in inputs
  // or while the export confirm is open.
  useEffect(() => {
    const docId = DOCS[docIndex].id;
    const handler = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement | null;
      if (
        el !== null &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.isContentEditable)
      ) {
        return;
      }
      if (event.key === 'j' || event.key === 'k') {
        setDocIndex(prev => {
          const next =
            event.key === 'j'
              ? Math.min(prev + 1, DOCS.length - 1)
              : Math.max(prev - 1, 0);
          return next;
        });
        setActivePassageId(null);
      } else if (event.key === 'r') {
        setCodingById(prev => ({
          ...prev,
          [docId]: {...(prev[docId] ?? EMPTY_CODING), relevance: 'relevant'},
        }));
      } else if (event.key === 'p') {
        setCodingById(prev => {
          const current = prev[docId] ?? EMPTY_CODING;
          const next: Privilege =
            current.privilege === 'ac'
              ? 'wp'
              : current.privilege === 'wp'
                ? 'none'
                : 'ac';
          return {...prev, [docId]: {...current, privilege: next}};
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [docIndex]);

  const savedCount = DOCS.filter(d => codingById[d.id]?.saved === true).length;

  const sessionEntries: LogEntry[] = DOCS.flatMap(d => {
    const c = codingById[d.id];
    if (c === undefined || (c.privilege !== 'ac' && c.privilege !== 'wp')) {
      return [];
    }
    return [
      {
        id: \`session-\${d.id}\`,
        doc: d.id,
        bates: d.bates,
        basis: c.privilege === 'wp' ? ('WP' as const) : ('AC' as const),
        description: d.autoLog,
        verify: 'unverified' as const,
        provenance: 'Auto-drafted this session · pending R. Vega QC',
      },
    ];
  });
  const logEntries = [...SESSION_LOG, ...sessionEntries];

  const panelBody = (
    <CodingPanelBody
      doc={doc}
      coding={coding}
      activePassageId={activePassageId}
      onPassageSelect={togglePassage}
      onAccept={acceptSuggestions}
      onSetAside={setAsideSuggestions}
      onCodingChange={patch => patchCoding(doc.id, patch)}
    />
  );
  const saveBar = (
    <SaveBar
      coding={coding}
      hasNext={docIndex < DOCS.length - 1}
      onSave={saveAndNext}
    />
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0}>
            <ReviewHeader
              docNumber={doc.number}
              sessionCoded={SESSION_BASE_CODED + savedCount}
              showKbdHints={!isPanelNarrow}
              canPrev={docIndex > 0}
              canNext={docIndex < DOCS.length - 1}
              onPrev={() => goTo(docIndex - 1)}
              onNext={() => goTo(docIndex + 1)}
            />
          </LayoutHeader>
        }
        end={
          !isStacked ? (
            <LayoutPanel
              width={isPanelNarrow ? 320 : 380}
              padding={0}
              hasDivider
              label="Coding panel">
              <div style={styles.panelColumn}>
                <div style={styles.panelScroll}>{panelBody}</div>
                <div style={styles.panelSaveBar}>{saveBar}</div>
              </div>
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent padding={0}>
            <div style={isStacked ? {...styles.backdrop, height: 'auto'} : styles.backdrop}>
              <div style={styles.paperColumn}>
                <DocumentPaper
                  doc={doc}
                  activePassageId={activePassageId}
                  onPassageSelect={togglePassage}
                />
                {isStacked ? (
                  <div style={styles.stackedPanel}>
                    <VStack gap={4}>
                      {panelBody}
                      <Divider />
                      {saveBar}
                    </VStack>
                  </div>
                ) : null}
              </div>
            </div>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider padding={0}>
            <ReviewFooter
              logEntries={logEntries}
              isDrawerOpen={isDrawerOpen}
              onToggleDrawer={() => setIsDrawerOpen(prev => !prev)}
              onExport={() => setIsExportOpen(true)}
            />
          </LayoutFooter>
        }
      />
      <AlertDialog
        isOpen={isExportOpen}
        onOpenChange={setIsExportOpen}
        title="Export privilege log?"
        description={\`The CSV will contain \${logEntries.length} entries with attorney–client privileged descriptions. \${sessionEntries.length > 0 ? 'Session entries are still unverified — R. Vega QC is pending. ' : ''}The export is recorded in the Casewright AI usage log with your name and a timestamp.\`}
        actionLabel="Export log"
        cancelLabel="Cancel"
        onAction={() => setIsExportOpen(false)}
      />
    </div>
  );
}
`;export{e as default};