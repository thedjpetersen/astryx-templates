// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only: one contract paragraph (Skylark Cloud
 *   MSA § 9.2 — Limitation of Liability, counterparty draft v4, matter
 *   M-2431 "Kestrel Labs — Atlas Launch Vendor Agreements"), one Casewright
 *   risk flag ("Uncapped liability", high severity, playbook LL-4) rendered
 *   in three frozen lifecycle states, a fixed resolution note ("Redline
 *   accepted in v5 · Jul 13"), and a fixed dismissal audit line (Julian
 *   Voss · client-approved exception · Jul 15). No clocks, no Math.random,
 *   no network assets; avatars are initials-only.
 * @output Inline Risk Flag Annotations — three side-by-side specimens of
 *   the clause-anchored Casewright risk annotation: specimen 01 is the
 *   high-risk state (red-washed carve-out span on the serif paper snippet
 *   beside the full margin flag card — "High risk" severity pill, the
 *   "Uncapped liability" title, a two-line AI rationale, clause + document
 *   citation chips, a playbook-reference chip, an honest confidence band,
 *   the unverified provenance row, the AI-disclosure line, and Acknowledge
 *   / Escalate actions); specimen 02 is the resolved state (the accepted
 *   v5 redline green-washed in the same clause, with a collapsed flag chip
 *   carrying the resolution note "Redline accepted in v5 · Jul 13" that
 *   expands to the retired flag's summary and verification provenance);
 *   specimen 03 is the suppressed state (the clause back to neutral with a
 *   dotted anchor underline, a "Flag dismissed by Julian Voss · reason:
 *   client-approved exception" audit chip, and a Reopen affordance that
 *   flips the chip to an amber pending-re-review row). Mono caption rows
 *   sit ABOVE each specimen. The three states are mutually exclusive
 *   lifecycle moments of ONE flag, shown side by side for anatomy — not a
 *   single timeline.
 * @position Block template; emitted by `astryx template risk-flag-annotations`
 *
 * Frame: no app shell — this is an INDIVIDUAL SMALL EXPERIENCE. A
 * full-bleed stage div (minHeight 100dvh, token muted wash with one soft
 * Casewright-purple radial tint) centers a small header and a vertical
 * column of three specimens; each specimen is min(720px, 100%) wide with
 * its caption row (mono state-id Token + one-line note) ABOVE it, per the
 * composer-state-gallery idiom. Inside a specimen, the light-locked serif
 * paper snippet (flex 1 1 340px) and the token-pure margin annotation rail
 * (flex 1 1 240px) sit side by side and wrap to stacked below ~620px. All
 * three specimens render one shared PaperSnippet component seeded with a
 * different span treatment, so the clause geometry stays registered.
 *
 * Responsive contract:
 * - >=720px: paper snippet | margin rail side by side in every specimen;
 *   the specimen column centers on the stage.
 * - <720px: each specimen's body flex-wraps — the margin rail drops below
 *   its paper snippet at full width; chip rows and action rows use
 *   flexWrap so nothing clips at 375px.
 * - Interactivity is local to each specimen: Acknowledge/Escalate resolve
 *   to a provenance status row, the resolved chip expands/collapses, and
 *   Reopen flips the audit chip to an amber pending row. All controls are
 *   real buttons with aria labels; nothing depends on hover.
 *
 * Container policy (specimen-gallery archetype): the margin flag card is a
 * design-system Card — a genuine annotation widget, the one container
 * Cards are for. The collapsed resolution chip and the dismissal audit
 * chip are styled rows (hand-rolled, token-pure), not Cards; the paper
 * snippet is a styled div, never an editable surface (live-editor
 * collision rule — no caret, no editing chrome).
 *
 * Color policy: ONE accent — the suite's Casewright AI purple
 * (light-dark(#6B1EFD, #C4A8FF) ink on light-dark(#F1EBFE, #322350) tint)
 * for the sparkle mark, the playbook chip, and the stage tint. The paper
 * snippet is deliberately scheme-locked light (colorScheme:'light') so the
 * contract reads as printed paper in both schemes — PAPER_* literals and
 * the risk washes stay raw hex on that locked surface. Severity inks are
 * light-dark() pairs (locked paper resolves the light half; app-chrome
 * chips brighten for dark backgrounds): red high-risk pair, green resolved
 * pair, amber reopened pair, plus the suite privilege-amber literals on
 * the paper's privilege microstrip. Everything else is token-pure so both
 * schemes pass AA.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  ArrowUpRightIcon,
  BookMarkedIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  FileTextIcon,
  HistoryIcon,
  LockIcon,
  PinIcon,
  RotateCcwIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from 'lucide-react';

import {StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Token} from '@astryxdesign/core/Token';

// ============= PAPER + RISK PAINT CONSTANTS =============
// Scheme-locked paper (see "Color policy" above): literal light values,
// locked with colorScheme:'light' so the washes hold in dark mode. Do not
// tokenize the PAPER_* values or the *_WASH literals.

const PAPER_BG = '#FFFFFF';
const PAPER_TEXT = '#1F2A37';
const PAPER_MUTED = '#6B7280';
const PAPER_RULE = '#E5E7EB';
/** Serif voice for contract content ONLY — chrome stays on tokens. */
const SERIF = "Georgia, 'Times New Roman', Times, serif";

// Severity vocabulary — same pairs as the Legal AI review surfaces:
// inks are light-dark() (locked paper resolves the light half, app chrome
// brightens for dark), washes paint only on the locked paper so they stay
// literal light hex.
const HIGH_INK = 'light-dark(#C0212F, #F87171)';
const HIGH_WASH = '#FBE3E4';
const RESOLVED_INK = 'light-dark(#0B7A2B, #4ADE80)';
const RESOLVED_WASH = '#E4F5E8';
const REOPEN_INK = 'light-dark(#96620D, #E0BB55)';

// Privilege microstrip — restrained amber wash, consistent suite treatment.
const PRIVILEGE_BG = 'light-dark(#FBF4DF, #3A3115)';
const PRIVILEGE_INK = 'light-dark(#6B4E0B, #E7CE82)';

// Casewright sparkle — the suite's single AI-attribution tint.
const AI_TINT_BG = 'light-dark(#F1EBFE, #322350)';
const AI_TINT_INK = 'light-dark(#6B1EFD, #C4A8FF)';
const AI_STAGE_TINT = 'light-dark(rgba(107,30,253,0.06), rgba(157,107,255,0.10))';

// ============= FIXTURES =============
// Casewright at Marlow & Voss LLP, matter M-2431 "Kestrel Labs — Atlas
// Launch Vendor Agreements". The annotated clause is the canonical Skylark
// Cloud MSA § 9.2 liability-cap issue: the v4 counterparty turn added a
// "Customer Configuration Event" carve-out that swallows the cap (the same
// flag the contract review and the negotiation diff surface). Lead: Julian
// Voss; day-to-day: David Chen; playbook owner: Ruth Vega. Suite "now":
// Wednesday, July 15, 2026 — all timestamps are fixed strings. The three
// specimens are mutually exclusive lifecycle states of this ONE flag.

const DOC_LINE = 'SKYLARK CLOUD — MASTER SERVICES AGREEMENT · DRAFT v4 · p. 18';
const MATTER_LINE = 'M-2431 · Kestrel Labs — Atlas Launch Vendor Agreements';
const PRIVILEGE_TEXT = 'Attorney-Client Privileged · Attorney Work Product';
const DISCLOSURE = 'AI-generated · verify before relying';

/**
 * The clause renders as lead + variable span + tail so all three specimens
 * share registered geometry. The high-risk and suppressed states carry the
 * v4 carve-out; the resolved state carries the accepted v5 redline (the
 * firm's equal-cap sentence) in its place.
 */
const CLAUSE = {
  heading: 'Section 9 — Limitation of Liability',
  label: '9.2 Cap on Liability.',
  lead: ' Except for the Excluded Claims, neither party’s aggregate liability arising out of or relating to this Agreement will exceed the fees paid or payable by Kestrel in the twelve (12) months preceding the event giving rise to the claim.',
  carveOut:
    ' Notwithstanding the foregoing, Skylark Cloud will have no liability for any incident affecting Customer Data to the extent caused by configurations, scripts, or access controls implemented by or on behalf of Kestrel (a “Customer Configuration Event”).',
  acceptedRedline:
    ' The cap in this Section 9.2 applies to Skylark Cloud and Kestrel equally, and nothing in this Section limits Skylark Cloud’s obligations under Section 11 (Data Protection).',
  tail: ' “Excluded Claims” means liability arising from a party’s fraud, willful misconduct, or breach of Section 12 (Confidentiality).',
} as const;

/** The one Casewright risk flag, as it appears when first raised. */
const FLAG = {
  title: 'Uncapped liability',
  severity: 'High risk',
  rationale:
    'The v4 carve-out lets Skylark Cloud call almost any Customer Data incident a “Customer Configuration Event” and step outside the § 9.2 cap entirely. Kestrel would carry unlimited exposure for exactly the incidents the cap exists to contain.',
  clauseChip: '§ 9.2 · Limitation of Liability',
  docChip: 'Skylark Cloud MSA v4 · p. 18',
  playbookChip: 'Playbook LL-4 · R. Vega',
  confidence: 'High confidence',
  unverifiedNote: 'Not yet verified against source',
} as const;

/** Where the flag can land once a reviewer acts on it (specimen 01). */
const ACTION_OUTCOME = {
  acknowledged: 'Acknowledged · D. Chen · Jul 15',
  escalated: 'Escalated to J. Voss · Jul 15',
} as const;

/** Resolved state (specimen 02): the redline went into working draft v5. */
const RESOLUTION = {
  chipLabel: 'Resolved',
  // Non-breaking spaces keep the "v5 · Jul 13" stamp together when the
  // narrow chip head forces a wrap (no orphaned "13" line).
  note: 'Redline accepted in v5 · Jul 13',
  wasLine: 'Was: High risk · Uncapped liability',
  detail:
    'The equal-cap sentence replaced Skylark’s configuration carve-out, per playbook LL-4.',
  verifiedLine: 'Verified · R. Vega · Jul 13',
} as const;

/** Suppressed state (specimen 03): partner dismissal with audit trail. */
const SUPPRESSION = {
  actor: 'Julian Voss',
  line: 'Flag dismissed by Julian Voss',
  reason: 'reason: client-approved exception',
  when: 'Jul 15, 2026 · 8:56 AM',
  reopenedLine: 'Reopened · pending re-review by D. Chen',
} as const;

/** Caption rows — mono state-id Token + one-line note, above each specimen. */
const CAPTIONS = {
  high: {
    stateId: '01 · high-risk',
    note: 'Red-washed carve-out with the full margin flag card — severity, rationale, citations, playbook position, acknowledge / escalate.',
  },
  resolved: {
    stateId: '02 · resolved',
    note: 'Accepted v5 redline green-washed; the flag collapses to a resolution chip that expands to the retired summary.',
  },
  suppressed: {
    stateId: '03 · suppressed',
    note: 'Clause back to neutral with a dotted anchor, the dismissal audit chip, and a reopen affordance.',
  },
} as const;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Muted token stage with one soft Casewright-purple radial tint; centers
  // the header and the specimen column.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage: `radial-gradient(1100px 460px at 50% -80px, ${AI_STAGE_TINT}, transparent 70%)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
  },
  stageHeader: {textAlign: 'center', maxWidth: 640},
  specimenColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-6)',
    width: 'min(720px, 100%)',
  },
  specimen: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // Caption row: the mono state-id Token is pinned (footgun 18 —
  // flexShrink 0) and the note takes the remaining width, wrapping freely.
  captionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  captionToken: {flexShrink: 0},
  captionNote: {minWidth: 0},
  // Specimen body: paper snippet | margin rail, wrapping to stacked.
  specimenBody: {
    display: 'flex',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
  },
  paperWrap: {flex: '1 1 340px', minWidth: 0},
  marginRail: {
    flex: '1 1 240px',
    minWidth: 0,
    maxWidth: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // The contract snippet: white paper, light-locked so the washes hold.
  paper: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
  },
  privilegeStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 4,
    backgroundColor: PRIVILEGE_BG,
    color: PRIVILEGE_INK,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    borderBottom: `1px solid ${PAPER_RULE}`,
  },
  paperInner: {
    padding: 'clamp(16px, 4vw, 28px)',
    fontFamily: SERIF,
  },
  docLine: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 10.5,
    letterSpacing: '0.04em',
    color: PAPER_MUTED,
    margin: 0,
  },
  matterLine: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 10.5,
    letterSpacing: '0.02em',
    color: PAPER_MUTED,
    margin: '2px 0 0',
  },
  clauseHeading: {
    fontSize: 15,
    fontWeight: 700,
    margin: '14px 0 8px',
    paddingBottom: 6,
    borderBottom: `1px solid ${PAPER_RULE}`,
  },
  clauseBody: {
    fontSize: 14,
    lineHeight: 1.7,
    margin: 0,
    textAlign: 'justify',
    hyphens: 'auto',
  },
  clauseLabel: {fontWeight: 700},
  // Span treatments (inline, wrap-safe: background + borderBottom paint on
  // every line fragment). On the locked paper the light-dark inks resolve
  // to their light halves.
  spanHigh: {
    backgroundColor: HIGH_WASH,
    borderBottom: `2px solid ${HIGH_INK}`,
    paddingBlock: 1,
  },
  spanResolved: {
    backgroundColor: RESOLVED_WASH,
    borderBottom: `2px solid ${RESOLVED_INK}`,
    paddingBlock: 1,
  },
  spanSuppressed: {
    // The neutral state renders in a <mark> like its siblings for shared
    // geometry — kill the UA's default yellow mark background.
    backgroundColor: 'transparent',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: PAPER_MUTED,
    textDecorationThickness: 1,
    textUnderlineOffset: 3,
  },
  // Casewright sparkle mark — the one accent surface on chrome.
  aiMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: AI_TINT_BG,
    color: AI_TINT_INK,
    flexShrink: 0,
  },
  disclosureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  chipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    flexWrap: 'wrap',
  },
  severityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  // Provenance / verification rows: colored inline rows, 12px, icon-led.
  provenanceRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
  },
  // Collapsed resolution chip + dismissal audit chip: styled rows, not
  // Cards — token-pure surfaces with a hairline border.
  marginChip: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  chipHeadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  chipHeadNote: {minWidth: 0, flex: '1 1 120px'},
  // Expand/collapse toggle on the resolution chip: a real button, no chrome.
  bareButton: {
    appearance: 'none',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 0,
    font: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  auditActorRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  auditBody: {minWidth: 0},
};

// ============= SHARED SPECIMEN BITS =============

/**
 * Specimen wrapper: mono state-id Token + one-line note ABOVE the body,
 * per the composer-state-gallery caption idiom (Token pinned, note wraps).
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
      <div style={styles.specimenBody}>{children}</div>
    </section>
  );
}

/** The suite-wide AI disclosure line: sparkle mark + fixed wording. */
function DisclosureLine() {
  return (
    <div style={styles.disclosureRow}>
      <span style={styles.aiMark} aria-hidden>
        <Icon icon={SparklesIcon} size="xsm" color="inherit" />
      </span>
      <Text type="supporting" size="xsm" color="secondary">
        {DISCLOSURE}
      </Text>
    </div>
  );
}

type SpanTreatment = 'high' | 'resolved' | 'suppressed';

const SPAN_STYLE: Record<SpanTreatment, CSSProperties> = {
  high: styles.spanHigh,
  resolved: styles.spanResolved,
  suppressed: styles.spanSuppressed,
};

/**
 * The static contract snippet — privilege microstrip, document + matter
 * stamp lines, clause heading, and the § 9.2 paragraph whose variable span
 * carries the state's treatment. The resolved state swaps the v4 carve-out
 * for the accepted v5 equal-cap redline; the other two keep the carve-out.
 * STATIC PREVIEW by design: no caret, no editing chrome.
 */
function PaperSnippet({treatment}: {treatment: SpanTreatment}) {
  const spanText =
    treatment === 'resolved' ? CLAUSE.acceptedRedline : CLAUSE.carveOut;
  return (
    <div style={styles.paperWrap}>
      <figure style={{...styles.paper, margin: 0}}>
        <div style={styles.privilegeStrip}>
          <Icon icon={LockIcon} size="xsm" color="inherit" />
          <span>{PRIVILEGE_TEXT}</span>
        </div>
        <div style={styles.paperInner}>
          <p style={styles.docLine}>{DOC_LINE}</p>
          <p style={styles.matterLine}>{MATTER_LINE}</p>
          <h3 style={styles.clauseHeading}>{CLAUSE.heading}</h3>
          <p style={styles.clauseBody}>
            <span style={styles.clauseLabel}>{CLAUSE.label}</span>
            {CLAUSE.lead}
            <mark style={{...SPAN_STYLE[treatment], color: 'inherit'}}>
              {spanText}
            </mark>
            {CLAUSE.tail}
          </p>
        </div>
      </figure>
    </div>
  );
}

// ============= MARGIN ANNOTATIONS =============

type FlagAction = 'open' | 'acknowledged' | 'escalated';

/**
 * Specimen 01 margin: the full Casewright flag card — severity pill +
 * mono anchor pin, risk title, two-line AI rationale, citation chips
 * (clause + document — an AI claim with no chip is a bug), playbook
 * reference, honest confidence band, unverified provenance, the
 * disclosure line, and Acknowledge / Escalate. Acting replaces the action
 * row with an attributed status row (human action = actor + date).
 */
function HighRiskFlagCard() {
  const [action, setAction] = useState<FlagAction>('open');
  return (
    <div style={styles.marginRail}>
      <Card padding={3}>
        <VStack gap={2}>
          <div style={styles.severityRow}>
            <span style={{flexShrink: 0}}>
              <Token
                label={FLAG.severity}
                size="sm"
                color="red"
                icon={<Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />}
              />
            </span>
            <StackItem size="fill">
              <span style={{...styles.provenanceRow, color: 'var(--color-text-secondary)'}}>
                <Icon icon={PinIcon} size="xsm" color="inherit" />
                {FLAG.clauseChip}
              </span>
            </StackItem>
          </div>
          <Heading level={3}>{FLAG.title}</Heading>
          <Text type="body" size="sm">
            {FLAG.rationale}
          </Text>
          <div style={styles.chipRow}>
            <Token
              label={FLAG.docChip}
              size="sm"
              color="gray"
              icon={<Icon icon={FileTextIcon} size="xsm" color="inherit" />}
            />
            <Token
              label={FLAG.playbookChip}
              size="sm"
              color="purple"
              icon={<Icon icon={BookMarkedIcon} size="xsm" color="inherit" />}
            />
          </div>
          <div style={styles.chipRow}>
            <Token label={FLAG.confidence} size="sm" color="default" />
            <span style={{...styles.provenanceRow, color: REOPEN_INK}}>
              <Icon icon={CircleAlertIcon} size="xsm" color="inherit" />
              {FLAG.unverifiedNote}
            </span>
          </div>
          <Divider />
          <DisclosureLine />
          {action === 'open' ? (
            <div style={styles.actionRow}>
              <Button
                label="Acknowledge"
                size="sm"
                variant="secondary"
                icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
                onClick={() => setAction('acknowledged')}
              />
              <Button
                label="Escalate to J. Voss"
                size="sm"
                variant="ghost"
                icon={<Icon icon={ArrowUpRightIcon} size="sm" color="inherit" />}
                onClick={() => setAction('escalated')}
              />
            </div>
          ) : (
            <span
              style={{
                ...styles.provenanceRow,
                color: action === 'acknowledged' ? RESOLVED_INK : REOPEN_INK,
              }}>
              <Icon
                icon={action === 'acknowledged' ? CircleCheckIcon : ArrowUpRightIcon}
                size="xsm"
                color="inherit"
              />
              {action === 'acknowledged'
                ? ACTION_OUTCOME.acknowledged
                : ACTION_OUTCOME.escalated}
            </span>
          )}
        </VStack>
      </Card>
    </div>
  );
}

/**
 * Specimen 02 margin: the collapsed resolution chip — green Resolved
 * Token + the resolution note, with an expand toggle revealing the retired
 * flag's summary and human verification provenance.
 */
function ResolvedFlagChip() {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div style={styles.marginRail}>
      <div style={styles.marginChip}>
        <div style={styles.chipHeadRow}>
          <span style={{flexShrink: 0}}>
            <Token
              label={RESOLUTION.chipLabel}
              size="sm"
              color="green"
              icon={<Icon icon={CircleCheckIcon} size="xsm" color="inherit" />}
            />
          </span>
          <div style={styles.chipHeadNote}>
            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
              {RESOLUTION.note}
            </Text>
          </div>
          <button
            type="button"
            style={styles.bareButton}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse resolved flag' : 'Expand resolved flag'}
            onClick={() => setIsExpanded(prev => !prev)}>
            <Icon
              icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
              size="sm"
              color="inherit"
            />
          </button>
        </div>
        {isExpanded ? (
          <VStack gap={2}>
            <Divider />
            <Text type="supporting" size="xsm" color="secondary">
              {RESOLUTION.wasLine}
            </Text>
            <Text type="body" size="sm">
              {RESOLUTION.detail}
            </Text>
            <div style={styles.chipRow}>
              <Token
                label={FLAG.playbookChip}
                size="sm"
                color="purple"
                icon={<Icon icon={BookMarkedIcon} size="xsm" color="inherit" />}
              />
            </div>
            <span style={{...styles.provenanceRow, color: RESOLVED_INK}}>
              <Icon icon={CircleCheckIcon} size="xsm" color="inherit" />
              {RESOLUTION.verifiedLine}
            </span>
            <DisclosureLine />
          </VStack>
        ) : null}
      </div>
    </div>
  );
}

// ============= SUPPRESSED ANNOTATION =============

/**
 * Specimen 03 margin: the dismissal audit chip — actor Avatar, the audit
 * line with its recorded reason and timestamp, and a Reopen affordance.
 * Reopening flips the chip footer to an amber pending-re-review row while
 * the audit trail itself stays visible (dismissals are never erased).
 */
function SuppressedAuditChip() {
  const [isReopened, setIsReopened] = useState(false);
  return (
    <div style={styles.marginRail}>
      <div style={styles.marginChip}>
        <div style={styles.chipHeadRow}>
          <span style={{flexShrink: 0}}>
            <Token
              label="Flag dismissed"
              size="sm"
              color="gray"
              icon={<Icon icon={HistoryIcon} size="xsm" color="inherit" />}
            />
          </span>
          <div style={styles.chipHeadNote}>
            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
              {SUPPRESSION.when}
            </Text>
          </div>
        </div>
        <div style={styles.auditActorRow}>
          <Avatar name={SUPPRESSION.actor} size="tiny" />
          {/* Text renders inline — each line needs its own block wrapper or
              the audit line and reason concatenate ("…Vossreason:"). */}
          <div style={styles.auditBody}>
            <div>
              <Text type="body" size="sm">
                {SUPPRESSION.line}
              </Text>
            </div>
            <div>
              <Text type="supporting" size="xsm" color="secondary">
                {SUPPRESSION.reason}
              </Text>
            </div>
          </div>
        </div>
        <Divider />
        {isReopened ? (
          <span style={{...styles.provenanceRow, color: REOPEN_INK}}>
            <Icon icon={CircleAlertIcon} size="xsm" color="inherit" />
            {SUPPRESSION.reopenedLine}
          </span>
        ) : (
          <div style={styles.actionRow}>
            <Button
              label="Reopen flag"
              size="sm"
              variant="ghost"
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              onClick={() => setIsReopened(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============= SPECIMENS =============

function HighRiskSpecimen() {
  return (
    <Specimen stateId={CAPTIONS.high.stateId} note={CAPTIONS.high.note}>
      <PaperSnippet treatment="high" />
      <HighRiskFlagCard />
    </Specimen>
  );
}

function ResolvedSpecimen() {
  return (
    <Specimen stateId={CAPTIONS.resolved.stateId} note={CAPTIONS.resolved.note}>
      <PaperSnippet treatment="resolved" />
      <ResolvedFlagChip />
    </Specimen>
  );
}

function SuppressedSpecimen() {
  return (
    <Specimen
      stateId={CAPTIONS.suppressed.stateId}
      note={CAPTIONS.suppressed.note}>
      <PaperSnippet treatment="suppressed" />
      <SuppressedAuditChip />
    </Specimen>
  );
}

// ============= PAGE =============

export default function RiskFlagAnnotationsTemplate() {
  return (
    <div style={styles.stage}>
      <header style={styles.stageHeader}>
        <VStack gap={1}>
          <Heading level={1}>Inline risk flag annotations</Heading>
          <Text type="supporting" color="secondary">
            The clause-anchored Casewright risk flag on the Skylark Cloud MSA
            § 9.2 liability cap — high-risk, resolved, and suppressed states,
            frozen side by side.
          </Text>
        </VStack>
      </header>
      <div style={styles.specimenColumn}>
        <HighRiskSpecimen />
        <ResolvedSpecimen />
        <SuppressedSpecimen />
      </div>
    </div>
  );
}





