var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only: the § 9 Limitation of Liability
 *   excerpt of the fictional Skylark Cloud MSA v4 (Marlow & Voss matter
 *   M-2431 for Kestrel Labs), one Casewright suggestion ("Tighten the
 *   indemnification carve-out") as kept/strike/insert runs, Ruth Vega's
 *   playbook Fallback 1 with its 34-of-50 deviation figure (matching
 *   clause-library-playbook), a fixed insert receipt (D. Chen · Jul 15,
 *   2026 · 2:42 PM PT), and Skylark's pending Jul 11 § 9.2 carve-out
 *   (matching contract-diff-negotiation). No clocks, no Math.random, no
 *   network assets; all authorities and parties fictional.
 * @output AI Drafting Sidebar — three specimens of the Casewright
 *   drafting-assistant panel beside a dimmed § 9 contract excerpt:
 *   01 (suggestion) — tracked-change proposed language (red strike +
 *   green insert), playbook-tier rationale, citation chips, an honest
 *   'High confidence' band, Insert / Edit / Dismiss, and the
 *   'AI-generated · verify before relying' disclosure; 02 (inserted) —
 *   success chip 'Inserted at § 9.2' with Undo, the clause clean on the
 *   paper, an insert receipt, and an amber 'Unverified · pending attorney
 *   review' row; 03 (redline-conflict) — amber 'Conflicts with a pending
 *   counterparty change in this section' warning with a View-conflict
 *   button and a hold-suggestion note, Insert disabled. Mono caption rows
 *   sit ABOVE each specimen.
 * @position Block template; emitted by \`astryx template ai-drafting-sidebar\`
 *
 * Frame: no app shell — this is an INDIVIDUAL SMALL EXPERIENCE. A
 * full-bleed stage div (minHeight 100dvh, token muted wash with one soft
 * AI-purple radial tint) centers a small header and a wrapping specimen
 * row, per the composer-state-gallery / meeting-notes-ai-card idiom. Each
 * specimen is a caption row (mono state-id Token + one-line note, Token
 * pinned with flexShrink 0 — footgun 18) ABOVE a two-column composite: the
 * dimmed light-locked serif contract excerpt (flex 1 1 280px) beside the
 * 340px Casewright drafting panel Card. All three specimens render one
 * shared ContractExcerpt + one shared panel scaffold seeded with different
 * frozen states, so paper and panel geometry stay registered.
 *
 * Responsive contract:
 * - >=1408px: specimens sit two per row (each min(660px, 100%) wide), the
 *   third wraps below, centered and top-aligned; <1408px the row wraps
 *   toward a single column, and inside each specimen the excerpt/panel
 *   columns wrap at <=720px so the paper stacks ABOVE the panel at full
 *   width — nothing clips at 375px. Panel meta rows (chips, receipts,
 *   actions) use flexWrap so chips drop a line instead of truncating.
 * - Interactivity is local to each specimen: 01's Insert/Dismiss settle
 *   the card to receipts with Undo; 02's Undo flips the success chip to a
 *   removed note with Re-insert; 03's buttons are real but inert links
 *   out. Nothing depends on hover.
 *
 * Container policy (anatomy-gallery archetype): the drafting panel is a
 * design-system Card — it is the genuine inspector widget Cards are for.
 * The contract excerpt is a styled light-locked paper div (document
 * surface, never a Card); captions use Token; rows inside the panel are
 * plain flex divs in the repo style-object idiom.
 *
 * Color policy: ONE accent — AI purple,
 * var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF)) — for
 * the sparkle mark, its soft wash, the stage tint, and the AI target-span
 * dotted underline on paper. Contract excerpts are scheme-locked light
 * paper (colorScheme:'light', PAPER_* literals — the doc-comments-review
 * idiom, documented exception); redline inks are light-dark() pairs
 * (insert green #0B7A2B/#4ADE80, strike red #C0212F/#F87171) whose washes
 * are paper-only literals; the counterparty pending change and every
 * warning/unverified surface share the semantic amber pair
 * light-dark(#B45309, #FBBF24) (chips via Token color="orange").
 * Everything else stays token-pure so both schemes pass AA.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckIcon,
  GitCompareArrowsIcon,
  LockIcon,
  PenLineIcon,
  PilcrowIcon,
  SparklesIcon,
  TriangleAlertIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Token} from '@astryxdesign/core/Token';

// ============= ACCENT + PAPER CONSTANTS =============
// ONE AI-purple accent (categorical token with the repo-standard fallback).
// Paper literals are scheme-locked light (see Color policy above); redline
// inks are light-dark pairs whose washes paint only on locked paper.

const AI_ACCENT = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const AI_SOFT = 'light-dark(rgba(107,30,253,0.08), rgba(157,107,255,0.14))';

const PAPER_BG = '#FFFFFF';
const PAPER_TEXT = '#1F2A37';
const PAPER_DIM = '#8A929E';
const PAPER_MUTED = '#6B7280';
const PAPER_RULE = '#E5E7EB';
const SERIF = "Georgia, 'Times New Roman', Times, serif";

const INSERT_INK = 'light-dark(#0B7A2B, #4ADE80)';
const INSERT_BG = '#E4F5E8';
const DELETE_INK = 'light-dark(#C0212F, #F87171)';
const DELETE_BG = '#FBE8EA';

// Counterparty pending-change amber; also the warning/unverified semantic.
const CP_AMBER = 'light-dark(#B45309, #FBBF24)';
const CP_WASH = '#FDF3D0';
const WARN_SOFT = 'light-dark(rgba(180,83,9,0.08), rgba(251,191,36,0.12))';

// ============= FIXTURES =============
// Deterministic Casewright / Marlow & Voss / Kestrel Labs fixtures (suite
// "now": Wed Jul 15, 2026). Cross-references reconcile: the fallback
// clause + 34-of-50 figure are Ruth Vega's playbook Fallback 1
// (clause-library-playbook); the pending § 9.2 carve-out is Skylark's
// Sat Jul 11 v4 turn (contract-diff-negotiation).

const DOCUMENT = {
  title: 'Skylark Cloud — Master Services Agreement',
  version: 'Counterparty turn v4 · received Sat, Jul 11, 2026',
  matter: 'M-2431 · Kestrel Labs — Atlas Launch Vendor Agreements',
  privilege: 'Attorney-Client Privileged · Attorney Work Product — do not forward',
};

const DISCLOSURE = 'AI-generated · verify before relying';

/**
 * The § 9 excerpt. § 9.2's clause (c) is the suggestion target; everything
 * else renders dimmed context. The three § 9.2 renderings per specimen:
 * - suggestion: v4 language as-is, clause (c) target-washed.
 * - inserted: clause (c) replaced by the clean playbook fallback language.
 * - conflict: v4 language plus Skylark's pending "(d)" carve-out in amber.
 */
const CLAUSE_9_HEADING = '9. Limitation of Liability';

const CLAUSE_9_1 =
  '9.1 Cap. Except as set forth in Section 9.2, neither party’s aggregate liability arising out of or related to this Agreement shall exceed the fees paid or payable by Customer in the twelve (12) months preceding the event giving rise to the claim.';

const CLAUSE_9_2_LEAD =
  '9.2 Carve-Outs. The limitations in Section 9.1 shall not apply to (a) Customer’s payment obligations; (b) a party’s breach of Section 7 (Confidentiality); or ';

const CARVEOUT_ORIGINAL = '(c) any claims arising under Section 8 (Indemnification).';

const CARVEOUT_PROPOSED =
  '(c) Provider’s obligations under Section 8.1 (Third-Party IP Infringement), which shall be subject to a separate cap of two times (2×) the fees paid in the preceding twelve (12) months.';

// Skylark's pending v4 insertion — a provider-favorable fourth carve-out
// (uncapped Customer liability for acceptable-use violations).
const CARVEOUT_PENDING_CP =
  ' The limitations in Section 9.1 shall further not apply to (d) Customer’s use of the Services in violation of Section 2 (Acceptable Use).';

const CLAUSE_9_3 =
  '9.3 Exclusion of Damages. Neither party shall be liable for any indirect, incidental, special, or consequential damages, including lost profits, even if advised of the possibility of such damages.';

/** Tracked-change runs for the proposed-language block in the panel. */
type TextRun = {kind: 'kept' | 'strike' | 'insert'; text: string};

const PROPOSED_RUNS: TextRun[] = [
  {kind: 'kept', text: '…breach of Section 7 (Confidentiality); or '},
  {kind: 'strike', text: CARVEOUT_ORIGINAL},
  {kind: 'insert', text: CARVEOUT_PROPOSED},
];

const SUGGESTION = {
  title: 'Tighten the indemnification carve-out',
  rationale:
    'The v4 carve-out sweeps every Section 8 claim outside the § 9.1 cap — including Kestrel’s own indemnification exposure. Playbook Fallback 1 accepts an uncapped-adjacent carve-out only for Provider’s third-party IP indemnity, under a 2× super-cap; that position held in 34 of the firm’s last 50 negotiated deviations.',
  confidence: 'High confidence',
  confidenceNote: 'Clause text matched playbook tier verbatim',
  playbookOwner: 'Firm playbook maintained by R. Vega',
};

const INSERTED = {
  chip: 'Inserted at § 9.2',
  receipt: 'Drafted by Casewright · accepted by D. Chen · Jul 15, 2026 · 2:42 PM PT',
  verifyNote: 'Not yet checked against the executed playbook source.',
  verifyAction: 'Request verification · R. Vega',
  undoNote: 'Removed from draft — the v4 carve-out is restored on the paper.',
};

const CONFLICT = {
  banner: 'Conflicts with a pending counterparty change in this section',
  detail:
    'Skylark’s v4 turn (received Sat, Jul 11) adds a new carve-out sentence to § 9.2 that has not been reviewed by the deal team. Inserting now would overwrite unreviewed counterparty language.',
  holdNote:
    'Suggestion held — resolve the counterparty redline first. Casewright will re-run this suggestion once the § 9 turn is triaged.',
  pendingChip: 'Counterparty · pending since Jul 11',
  viewAction: 'View in redline compare',
};

/** Citation chips shared by every panel state (assertion → source). */
const CHIPS: ReadonlyArray<{label: string; color: 'default' | 'purple'; hasIcon: boolean}> = [
  {label: '§ 9.2 · Carve-Outs', color: 'default', hasIcon: true},
  {label: 'Skylark MSA v4 · p. 31', color: 'default', hasIcon: false},
  {label: 'Playbook · Limitation of Liability · Fallback 1', color: 'purple', hasIcon: true},
];

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Muted token stage with one soft AI-purple radial tint.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage: \`radial-gradient(1100px 460px at 50% -80px, \${AI_SOFT}, transparent 70%)\`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
  },
  stageHeader: {textAlign: 'center', maxWidth: 640},
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
  },
  specimen: {
    width: 'min(660px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // Caption row: mono state-id Token pinned (footgun 18); note wraps.
  captionRow: {display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-2)'},
  captionToken: {flexShrink: 0},
  captionNote: {minWidth: 0},
  // Composite: dimmed paper excerpt beside the 340px panel; wraps <=720px.
  composite: {display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 'var(--spacing-3)'},
  excerptColumn: {flex: '1 1 280px', minWidth: 0, display: 'flex'},
  panelColumn: {flex: '0 1 340px', minWidth: 'min(300px, 100%)'},
  // The dimmed contract excerpt: light-locked paper, serif document voice.
  // Flex column so the marginalia pin row docks to the paper's bottom edge
  // when the composite stretches the paper taller than its text.
  paper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: PAPER_BG,
    color: PAPER_DIM,
    colorScheme: 'light',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    padding: '18px 22px 22px',
    fontFamily: SERIF,
    minWidth: 0,
  },
  privilegeStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'var(--font-family-sans, system-ui, sans-serif)',
    fontSize: 10,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: PAPER_MUTED,
    borderBottom: \`1px solid \${PAPER_RULE}\`,
    paddingBottom: 8,
    marginBottom: 12,
  },
  paperDocLine: {
    fontFamily: 'var(--font-family-sans, system-ui, sans-serif)',
    fontSize: 11,
    color: PAPER_MUTED,
    margin: '0 0 12px',
  },
  clauseHeading: {
    fontSize: 15,
    fontWeight: 700,
    color: PAPER_TEXT,
    margin: '0 0 10px',
  },
  clausePara: {
    fontSize: 13,
    lineHeight: 1.8,
    margin: '0 0 12px',
    overflowWrap: 'break-word',
  },
  // The target clause paragraph keeps full ink; siblings stay dimmed.
  clauseFocus: {color: PAPER_TEXT},
  // AI target span: soft purple wash + dotted underline (specimen 01).
  targetSpan: {
    backgroundColor: 'rgba(107,30,253,0.07)',
    borderBottom: '2px dotted #6B1EFD',
    borderRadius: 3,
    paddingInline: 1,
    color: PAPER_TEXT,
  },
  // Freshly inserted clean language (specimen 02): quiet green wash only.
  insertedSpan: {
    backgroundColor: INSERT_BG,
    borderRadius: 3,
    paddingInline: 1,
    color: PAPER_TEXT,
  },
  // Counterparty pending insertion (specimen 03): amber wash + underline.
  pendingSpan: {
    backgroundColor: CP_WASH,
    textDecoration: 'underline',
    textDecorationColor: '#B45309',
    textDecorationThickness: 2,
    textUnderlineOffset: 3,
    borderRadius: 3,
    paddingInline: 1,
    color: PAPER_TEXT,
  },
  // Marginalia pin under the excerpt body (sans, chrome voice on paper).
  paperPinRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    fontFamily: 'var(--font-family-sans, system-ui, sans-serif)',
    fontSize: 11,
    color: PAPER_MUTED,
    borderTop: \`1px solid \${PAPER_RULE}\`,
    paddingTop: 8,
    marginTop: 'auto',
  },
  // ---- Drafting panel (app chrome; token-pure) ----
  aiMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: AI_SOFT,
    color: AI_ACCENT,
    flexShrink: 0,
  },
  metaRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  chipRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', flexWrap: 'wrap'},
  chipPinned: {flexShrink: 0},
  // Proposed-language block: a light-locked serif mini-paper inside the
  // panel so tracked-change inks hold in both schemes (paper idiom).
  proposalBlock: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    border: \`1px solid \${PAPER_RULE}\`,
    borderRadius: 'var(--radius-container)',
    padding: '10px 12px',
    fontFamily: SERIF,
    fontSize: 13,
    lineHeight: 1.75,
    overflowWrap: 'break-word',
  },
  strikeText: {
    color: DELETE_INK,
    backgroundColor: DELETE_BG,
    textDecoration: 'line-through',
    textDecorationColor: DELETE_INK,
    textDecorationThickness: 2,
    borderRadius: 3,
    paddingInline: 1,
    marginRight: 2,
  },
  insText: {
    color: INSERT_INK,
    backgroundColor: INSERT_BG,
    textDecoration: 'underline',
    textDecorationColor: INSERT_INK,
    textDecorationThickness: 2,
    textUnderlineOffset: 3,
    fontStyle: 'normal',
    borderRadius: 3,
    paddingInline: 1,
  },
  keptText: {color: PAPER_MUTED},
  // Amber conflict banner / unverified row (semantic amber, both schemes).
  warnBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    backgroundColor: WARN_SOFT,
    border: \`var(--border-width) solid \${CP_AMBER}\`,
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  warnIcon: {color: CP_AMBER, flexShrink: 0, display: 'inline-flex', marginTop: 2},
  warnBody: {minWidth: 0},
  // Action row: buttons wrap instead of clipping on narrow panels.
  actionRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  // Disclosure footer under a divider; sparkle stays with the text.
  disclosureRow: {display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap'},
  disclosureMark: {color: AI_ACCENT, display: 'inline-flex', flexShrink: 0},
  disclosureText: {minWidth: 0, flex: '1 1 160px'},
  // Hand-rolled link-styled buttons (view conflict, receipts) — real
  // buttons for keyboard users, accent text, no chrome.
  linkButton: {
    appearance: 'none',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 0,
    font: 'inherit',
    fontSize: 12,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--color-accent)',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
  },
  // Settled receipts (dismissed / removed) — quiet muted rows.
  receiptRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
};

// ============= SHARED SPECIMEN BITS =============

/**
 * Specimen wrapper: mono state-id Token + one-line note ABOVE the
 * excerpt/panel composite, per the composer-state-gallery caption idiom.
 */
function Specimen({
  stateId,
  note,
  children,
}: {
  stateId: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section style={styles.specimen} aria-label={stateId}>
      <div style={styles.captionRow}>
        <span style={styles.captionToken}>
          <Token label={stateId} size="sm" color="gray" />
        </span>
        <div style={styles.captionNote}>
          <Text type="supporting" size="xsm" color="secondary">
            {note}
          </Text>
        </div>
      </div>
      <div style={styles.composite}>{children}</div>
    </section>
  );
}

type ExcerptVariant = 'suggestion' | 'inserted' | 'conflict';

/**
 * The dimmed § 9 excerpt. § 9.1 and § 9.3 always render as dimmed
 * context; § 9.2 varies per specimen — target-washed v4 language,
 * clean inserted language, or v4 language plus the amber pending
 * counterparty sentence. Static styled preview only: no caret, no
 * editing chrome (live-editor collision rule).
 */
function ContractExcerpt({variant}: {variant: ExcerptVariant}) {
  return (
    <div style={styles.excerptColumn}>
      <div style={styles.paper}>
        <div style={styles.privilegeStrip}>
          <Icon icon={LockIcon} size="xsm" color="inherit" />
          <span>{DOCUMENT.privilege}</span>
        </div>
        <p style={styles.paperDocLine}>
          {DOCUMENT.title} — {DOCUMENT.version}
        </p>
        <h3 style={styles.clauseHeading}>{CLAUSE_9_HEADING}</h3>
        <p style={styles.clausePara}>{CLAUSE_9_1}</p>
        <p style={{...styles.clausePara, ...styles.clauseFocus}}>
          {CLAUSE_9_2_LEAD}
          {variant === 'suggestion' ? (
            <span style={styles.targetSpan}>{CARVEOUT_ORIGINAL}</span>
          ) : null}
          {variant === 'inserted' ? (
            <span style={styles.insertedSpan}>{CARVEOUT_PROPOSED}</span>
          ) : null}
          {variant === 'conflict' ? (
            <>
              <span style={styles.targetSpan}>{CARVEOUT_ORIGINAL}</span>
              <span style={styles.pendingSpan}>{CARVEOUT_PENDING_CP}</span>
            </>
          ) : null}
        </p>
        <p style={styles.clausePara}>{CLAUSE_9_3}</p>
        <div style={styles.paperPinRow}>
          <span>
            {variant === 'suggestion'
              ? 'Casewright target · § 9.2, clause (c)'
              : variant === 'inserted'
                ? 'Inserted at § 9.2 · Jul 15, 2026 · 2:42 PM PT'
                : \`\${CONFLICT.pendingChip} · unreviewed\`}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Panel header shared by all three states: sparkle mark + product label,
 * suggestion title, and the matter/document context line.
 */
function PanelHeader({title}: {title: string}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <span style={styles.aiMark} aria-hidden>
          <Icon icon={SparklesIcon} size="sm" color="inherit" />
        </span>
        <StackItem size="fill">
          <Text type="supporting" size="xsm" color="secondary">
            Casewright · Drafting assistant
          </Text>
        </StackItem>
      </HStack>
      <VStack gap={1}>
        <Heading level={2}>{title}</Heading>
        <Text type="supporting" size="xsm" color="secondary">
          {DOCUMENT.matter}
        </Text>
      </VStack>
    </VStack>
  );
}

/** Citation chips: clause pin, source page, and firm-playbook position. */
function CitationChips() {
  return (
    <div style={styles.chipRow}>
      {CHIPS.map(chip => (
        <span key={chip.label} style={styles.chipPinned}>
          <Token
            label={chip.label}
            size="sm"
            color={chip.color}
            icon={
              chip.hasIcon ? (
                <Icon
                  icon={chip.color === 'purple' ? BookOpenIcon : PilcrowIcon}
                  size="xsm"
                  color="inherit"
                />
              ) : undefined
            }
          />
        </span>
      ))}
    </div>
  );
}

/** Disclosure footer: one shared treatment across the whole suite. */
function DisclosureFooter() {
  return (
    <VStack gap={2}>
      <Divider />
      <div style={styles.disclosureRow}>
        <span style={styles.disclosureMark} aria-hidden>
          <Icon icon={SparklesIcon} size="xsm" color="inherit" />
        </span>
        <div style={styles.disclosureText}>
          <Text type="supporting" size="xsm" color="secondary">
            {DISCLOSURE}
          </Text>
        </div>
      </div>
    </VStack>
  );
}

/** Tracked-change proposed language on a serif mini-paper block. */
function ProposalBlock() {
  return (
    <div style={styles.proposalBlock}>
      {PROPOSED_RUNS.map(run =>
        run.kind === 'strike' ? (
          <del key={run.text} style={styles.strikeText}>{run.text}</del>
        ) : run.kind === 'insert' ? (
          <ins key={run.text} style={styles.insText}>{run.text}</ins>
        ) : (
          <span key={run.text} style={styles.keptText}>{run.text}</span>
        ),
      )}
    </div>
  );
}

// ============= PANELS =============

type SuggestionResolution = 'open' | 'inserted' | 'dismissed';

/**
 * Specimen 01 — the live suggestion card. Insert settles the card to a
 * compact inserted receipt; Dismiss settles it to a dismissed receipt
 * with Undo. Both settle locally so the frozen specimens stay distinct.
 */
function SuggestionPanel() {
  const [resolution, setResolution] = useState<SuggestionResolution>('open');

  return (
    <div style={styles.panelColumn}>
      <Card padding={3}>
        <VStack gap={3}>
          <PanelHeader title={SUGGESTION.title} />
          <Divider />
          {resolution === 'open' ? (
            <>
              <VStack gap={2}>
                <Text type="body" size="sm" weight="bold">
                  Proposed language
                </Text>
                <ProposalBlock />
              </VStack>
              <VStack gap={1}>
                <Text type="body" size="sm" weight="bold">
                  Why Casewright suggests this
                </Text>
                <Text type="body" size="sm" color="secondary">
                  {SUGGESTION.rationale}
                </Text>
                <Text type="supporting" size="xsm" color="secondary">
                  {SUGGESTION.playbookOwner}
                </Text>
              </VStack>
              <CitationChips />
              <div style={styles.metaRow}>
                <span style={styles.chipPinned}>
                  <Token label={SUGGESTION.confidence} size="sm" color="green" />
                </span>
                <Text type="supporting" size="xsm" color="secondary">
                  {SUGGESTION.confidenceNote}
                </Text>
              </div>
              <div style={styles.actionRow}>
                <Button
                  label="Insert at § 9.2"
                  size="sm"
                  variant="primary"
                  icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
                  onClick={() => setResolution('inserted')}
                />
                <Button
                  label="Edit first"
                  size="sm"
                  variant="secondary"
                  icon={<Icon icon={PenLineIcon} size="sm" color="inherit" />}
                  onClick={() => {}}
                />
                <IconButton
                  label="Dismiss suggestion"
                  tooltip="Dismiss"
                  size="sm"
                  variant="ghost"
                  icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                  onClick={() => setResolution('dismissed')}
                />
              </div>
            </>
          ) : null}
          {resolution === 'inserted' ? (
            <div style={styles.receiptRow}>
              <Badge label={INSERTED.chip} variant="success" />
              <div style={styles.warnBody}>
                <Text type="supporting" size="xsm" color="secondary">
                  Pending attorney review — see specimen 02 for the settled state.
                </Text>
              </div>
            </div>
          ) : null}
          {resolution === 'dismissed' ? (
            <div style={styles.receiptRow}>
              <div style={styles.warnBody}>
                <Text type="supporting" size="xsm" color="secondary">
                  Suggestion dismissed — logged to the matter’s AI usage trail.{' '}
                  <button
                    type="button"
                    style={styles.linkButton}
                    onClick={() => setResolution('open')}>
                    Undo
                  </button>
                </Text>
              </div>
            </div>
          ) : null}
          <DisclosureFooter />
        </VStack>
      </Card>
    </div>
  );
}

/**
 * Specimen 02 — the inserted state. Success chip with an Undo affordance,
 * the insert receipt (actor + timestamp), and the first-class amber
 * unverified row: human verification is an explicit action with an actor —
 * AI output never self-verifies.
 */
function InsertedPanel() {
  const [isInserted, setIsInserted] = useState(true);

  return (
    <div style={styles.panelColumn}>
      <Card padding={3}>
        <VStack gap={3}>
          <PanelHeader title={SUGGESTION.title} />
          <Divider />
          {isInserted ? (
            <>
              <div style={styles.metaRow}>
                <Badge label={INSERTED.chip} variant="success" />
                <Button
                  label="Undo"
                  size="sm"
                  variant="ghost"
                  icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
                  onClick={() => setIsInserted(false)}
                />
              </div>
              <VStack gap={2}>
                <Text type="body" size="sm" weight="bold">
                  Clause as inserted
                </Text>
                <div style={styles.proposalBlock}>{CARVEOUT_PROPOSED}</div>
                <Text type="supporting" size="xsm" color="secondary">
                  {INSERTED.receipt}
                </Text>
              </VStack>
              <CitationChips />
              <div style={styles.warnBanner}>
                <span style={styles.warnIcon} aria-hidden>
                  <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
                </span>
                <div style={styles.warnBody}>
                  <VStack gap={1}>
                    <div style={styles.metaRow}>
                      <span style={styles.chipPinned}>
                        <Token label="Unverified · pending attorney review" size="sm" color="orange" />
                      </span>
                    </div>
                    <Text type="supporting" size="xsm" color="secondary">
                      {INSERTED.verifyNote}
                    </Text>
                    <Button label={INSERTED.verifyAction} size="sm" variant="secondary" onClick={() => {}} />
                  </VStack>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.receiptRow}>
              <div style={styles.warnBody}>
                <Text type="supporting" size="xsm" color="secondary">
                  {INSERTED.undoNote}{' '}
                  <button
                    type="button"
                    style={styles.linkButton}
                    onClick={() => setIsInserted(true)}>
                    Re-insert
                  </button>
                </Text>
              </div>
            </div>
          )}
          <DisclosureFooter />
        </VStack>
      </Card>
    </div>
  );
}

/**
 * Specimen 03 — the redline-conflict state. The amber banner explains the
 * pending counterparty change; the suggestion is held (Insert disabled)
 * until the § 9 turn is triaged in the redline compare.
 */
function ConflictPanel() {
  return (
    <div style={styles.panelColumn}>
      <Card padding={3}>
        <VStack gap={3}>
          <PanelHeader title={SUGGESTION.title} />
          <Divider />
          <div style={styles.warnBanner}>
            <span style={styles.warnIcon} aria-hidden>
              <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
            </span>
            <div style={styles.warnBody}>
              <VStack gap={1}>
                <Text type="body" size="sm" weight="bold">
                  {CONFLICT.banner}
                </Text>
                <Text type="supporting" size="xsm" color="secondary">
                  {CONFLICT.detail}
                </Text>
                <Button
                  label={CONFLICT.viewAction}
                  size="sm"
                  variant="secondary"
                  icon={<Icon icon={GitCompareArrowsIcon} size="sm" color="inherit" />}
                  onClick={() => {}}
                />
              </VStack>
            </div>
          </div>
          <div style={styles.metaRow}>
            <span style={styles.chipPinned}>
              <Token label="Suggestion held" size="sm" color="orange" />
            </span>
            <span style={styles.chipPinned}>
              <Token label={CONFLICT.pendingChip} size="sm" color="default" />
            </span>
          </div>
          <Text type="supporting" size="xsm" color="secondary">
            {CONFLICT.holdNote}
          </Text>
          <VStack gap={2}>
            <Text type="body" size="sm" weight="bold">
              Proposed language (held)
            </Text>
            <ProposalBlock />
          </VStack>
          <CitationChips />
          <div style={styles.actionRow}>
            <Button
              label="Insert at § 9.2"
              size="sm"
              variant="primary"
              isDisabled
              icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
              onClick={() => {}}
            />
            <button type="button" style={styles.linkButton}>
              Open § 9 in the change list
              <Icon icon={ArrowUpRightIcon} size="xsm" color="inherit" />
            </button>
          </div>
          <DisclosureFooter />
        </VStack>
      </Card>
    </div>
  );
}

// ============= PAGE =============

export default function AiDraftingSidebarTemplate() {
  return (
    <div style={styles.stage}>
      <header style={styles.stageHeader}>
        <VStack gap={1}>
          <Heading level={1}>AI drafting sidebar</Heading>
          <Text type="supporting" color="secondary">
            The Casewright drafting-assistant panel beside the Skylark Cloud
            MSA’s § 9 — suggestion, inserted, and redline-conflict states,
            frozen side by side.
          </Text>
        </VStack>
      </header>
      <div style={styles.specimenRow}>
        <Specimen
          stateId="01 · suggestion"
          note="Proposed carve-out language as a tracked change, with playbook rationale and Insert / Edit / Dismiss.">
          <ContractExcerpt variant="suggestion" />
          <SuggestionPanel />
        </Specimen>
        <Specimen
          stateId="02 · inserted"
          note="Clause landed clean at § 9.2 with an insert receipt, Undo, and an amber pending-review row.">
          <ContractExcerpt variant="inserted" />
          <InsertedPanel />
        </Specimen>
        <Specimen
          stateId="03 · redline-conflict"
          note="Suggestion held: a pending Skylark change to § 9.2 must be triaged before inserting.">
          <ContractExcerpt variant="conflict" />
          <ConflictPanel />
        </Specimen>
      </div>
    </div>
  );
}
`;export{e as default};