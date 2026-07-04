var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only: one Casewright new-matter conflicts run
 *   for "Kestrel Labs — Series C Financing" (proposed M-2417, requested by
 *   Eleanor Marlow, run Tue Jul 14, 2026), three matter parties (Kestrel
 *   Labs, Meridian Growth Partners, Skylark Cloud), three firm databases
 *   (clients & former clients 1,462 records; adverse parties 3,918; related
 *   entities 12,467 — totals reconcile to 17,847 in the cleared summary),
 *   one potential-conflict hit (Meridian Growth Partners — adverse party in
 *   closed matter M-2019-0331, Voss, 2019, no waiver on file), and Ruth
 *   Vega's canonical Jul 14 clearance with waiver memo. Fixed strings only —
 *   no clocks, no randomness, no network assets.
 * @output Conflicts Check Card — three side-by-side specimens of the
 *   Casewright new-matter conflicts-check card: specimen 01 is the running
 *   state (matter-party list, per-database progress rows with clients and
 *   adverse parties complete and related entities still scanning behind a
 *   determinate ProgressBar, every action disabled); specimen 02 is the
 *   potential-conflict state (amber result row for the Meridian Growth
 *   Partners hit with match-basis citation chips, a three-node relationship
 *   diagram mini, an honest confidence band, a "No waiver on file" chip, and
 *   Escalate-to-ethics + Propose-screen-team affordances); specimen 03 is
 *   the cleared state (green all-clear, checked-databases summary whose one
 *   cleared hit carries Ruth Vega's provenance, completion timestamp, and a
 *   Log-to-matter-file action that resolves to a confirmation chip). Mono
 *   caption rows sit ABOVE each specimen.
 * @position Block template; emitted by \`astryx template conflict-check-card\`
 *
 * Frame: no app shell — this is an INDIVIDUAL SMALL EXPERIENCE. A full-bleed
 * stage div (minHeight 100dvh, token muted wash with one soft AI-purple
 * radial tint) centers a small header and a wrapping specimen row; each
 * specimen is a 400px-wide Card (its natural width when embedded in the
 * intake queue's detail pane) with its caption row (mono state-id Token +
 * one-line note) ABOVE the card, per the composer-state-gallery /
 * meeting-notes-ai-card idiom. All three specimens share one header,
 * parties, and database-row anatomy so geometry stays registered.
 *
 * Responsive contract:
 * - >=1360px: the three specimens sit side by side, top-aligned, centered.
 * - <1360px: the specimen row flex-wraps (2+1, then a single stacked
 *   column); each card keeps width:min(400px, 100%) so nothing clips at
 *   375px. Meta rows, chip rows, and the action row use flexWrap so chips
 *   drop to a new line instead of truncating; the relationship diagram is a
 *   viewBox-scaled SVG that shrinks with the card.
 * - Interactivity is local to each specimen: Escalate-to-ethics and
 *   Propose-screen-team resolve to confirmation chips in specimen 02;
 *   Log-to-matter-file resolves to a logged chip in specimen 03. All
 *   controls are real buttons with labels; nothing depends on hover.
 *
 * Container policy (specimen-gallery archetype): the conflicts card is a
 * design-system Card — a genuine summary/inspector widget, the one container
 * Cards are for. Inside it, rows are plain flex divs in the repo
 * style-object idiom; captions and status vocabulary use Token; the
 * relationship diagram is a hand-rolled inline SVG on token colors.
 *
 * Color policy: ONE accent — Casewright AI purple,
 * var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF)) — for
 * the sparkle mark, its soft chip wash, and the stage tint. Semantic state
 * pairs: amber light-dark(#B45309, #FBBF24) for the potential-conflict row,
 * waiver chip, and the flagged diagram node; green
 * var(--color-data-categorical-green, light-dark(#0B991F, #34C759)) for the
 * all-clear surface and cleared provenance. No scheme-locked surfaces —
 * everything else stays token-pure so both schemes pass AA.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  DatabaseIcon,
  FileCheck2Icon,
  LockIcon,
  ScaleIcon,
  ShieldIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from 'lucide-react';

import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Token} from '@astryxdesign/core/Token';

// ============= ACCENT CONSTANTS =============
// ONE Casewright AI-purple accent (categorical token with repo-standard
// fallback); amber and green pairs are semantic state colors only.

const AI_ACCENT =
  'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const AI_SOFT = 'light-dark(rgba(107,30,253,0.08), rgba(157,107,255,0.14))';
const AMBER = 'light-dark(#B45309, #FBBF24)';
const AMBER_WASH = 'light-dark(rgba(180,83,9,0.07), rgba(251,191,36,0.10))';
const GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const GREEN_WASH = 'light-dark(rgba(11,153,31,0.07), rgba(52,199,89,0.10))';

// ============= FIXTURES =============
// Deterministic Casewright / Marlow & Voss / Kestrel fixtures (suite "now":
// Wed Jul 15, 2026). Counts reconcile everywhere they repeat: the three
// database record counts (1,462 + 3,918 + 12,467) sum to the 17,847 in the
// cleared summary; the one adverse-party candidate in the running state IS
// the Meridian hit in specimen 02 and the one cleared hit in specimen 03;
// Ruth Vega's Jul 14 clearance matches the canonical intake clearance that
// the AI usage log records as a conflicts-search event.

const INTAKE = {
  product: 'Casewright · Conflicts check',
  matterName: 'Kestrel Labs — Series C Financing',
  matterNo: 'M-2417',
  matterStage: 'New matter · intake',
  requestedBy: 'Requested by Eleanor Marlow',
  runStamp: 'Run Tue, Jul 14, 2026 · 4:49 PM PT',
  privilege: 'Confidential · Attorney Work Product',
};

interface Party {
  name: string;
  role: string;
}

/** The three matter parties Casewright searched across the firm databases. */
const PARTIES: Party[] = [
  {name: 'Kestrel Labs', role: 'Client · existing'},
  {name: 'Meridian Growth Partners', role: 'Lead investor · counterparty'},
  {name: 'Skylark Cloud', role: 'Related entity · concurrent vendor matter'},
];

type DbState = 'complete' | 'scanning' | 'candidate';

interface DbRow {
  id: string;
  label: string;
  records: string;
  /** Fixed integer for the cleared-summary reconciliation note. */
  state: DbState;
  detail: string;
}

/**
 * Running-state database rows: clients and adverse parties are done (the
 * adverse pass already surfaced its one candidate), related entities is
 * still scanning at a frozen 8,014 of 12,467 (64%).
 */
const DB_ROWS_RUNNING: DbRow[] = [
  {
    id: 'clients',
    label: 'Clients & former clients',
    records: '1,462 records',
    state: 'complete',
    detail: '0 hits',
  },
  {
    id: 'adverse',
    label: 'Adverse parties',
    records: '3,918 records',
    state: 'candidate',
    detail: '1 candidate pending review',
  },
  {
    id: 'related',
    label: 'Related entities',
    records: '12,467 records',
    state: 'scanning',
    detail: '8,014 of 12,467 scanned',
  },
];

const SCAN_PROGRESS = {value: 64, label: 'Scanning related entities'};

/** Cleared-state database rows: every pass complete, the one hit cleared. */
const DB_ROWS_CLEARED: DbRow[] = [
  {...DB_ROWS_RUNNING[0], detail: '0 hits'},
  {
    ...DB_ROWS_RUNNING[1],
    state: 'complete',
    detail: '1 hit cleared · R. Vega memo',
  },
  {...DB_ROWS_RUNNING[2], state: 'complete', detail: '0 hits'},
];

/**
 * The one potential conflict: Meridian Growth Partners was the adverse
 * party in a closed 2019 matter led by Julian Voss. Fictional matter only.
 */
const HIT = {
  party: 'Meridian Growth Partners',
  basis: 'Adverse party in closed matter M-2019-0331 (Voss, 2019)',
  matterChip: 'M-2019-0331',
  matterDetail: 'Tandem Reach Ventures — fund restructuring',
  closedDetail: 'Closed Nov 2019 · lead: Julian Voss',
  confidence: 'High confidence — exact entity-name match',
  waiver: 'No waiver on file',
  clearanceState: 'Pending clearance',
};

/** Three-node relationship diagram fixture (rendered as an inline SVG). */
const DIAGRAM = {
  nodeA: {title: 'Kestrel Labs', sub: 'new matter · M-2417'},
  nodeB: {title: 'Meridian Growth Partners', sub: 'shared party · no waiver'},
  nodeC: {title: 'M-2019-0331', sub: 'Voss · closed 2019'},
  edgeAB: 'lead investor',
  edgeBC: 'adverse party',
  ariaLabel:
    'Relationship diagram: Meridian Growth Partners is the lead investor on the new Kestrel Labs matter M-2417 and was the adverse party in closed matter M-2019-0331.',
};

const CLEARED = {
  headline: 'No open conflicts — clear to engage',
  completed: 'Completed Tue, Jul 14, 2026 · 4:52 PM PT',
  summary: '3 databases · 17,847 records · 1 hit cleared',
  clearance: 'Cleared · Ruth Vega · Jul 14, 6:08 PM PT',
  memo: 'Waiver memo attached — closed 2019 matter, unrelated subject matter; no current adversity.',
  loggedChip: 'Logged to matter file · M-2417 · Jul 14',
};

const RUNNING_NOTE = 'Results pending — actions unlock when every pass completes.';
const DISCLOSURE = 'AI-generated · verify before relying';


// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Muted token stage with one soft AI-purple radial tint; centers the
  // header and the wrapping specimen row.
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
    width: 'min(400px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // Caption row: the mono state-id Token is pinned (footgun 18 — never
  // shrinks into an ellipsis); the one-line note wraps instead.
  captionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  captionToken: {flexShrink: 0},
  captionNote: {minWidth: 0},
  // Sparkle mark: soft purple chip, the one accent surface on the card.
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
  // Meta/chip rows wrap on narrow widths instead of truncating chips.
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  privilegeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--color-text-secondary)',
  },
  partyRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    paddingBlock: 2,
  },
  partyName: {flexShrink: 0},
  partyRole: {minWidth: 0},
  // Database progress rows: fixed icon slot so labels share a gridline;
  // record counts right-align on tabular numerals.
  dbRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  dbIconSlot: {
    width: 20,
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 2,
    flexShrink: 0,
  },
  dbBody: {minWidth: 0, flex: 1},
  dbRecords: {
    marginLeft: 'auto',
    flexShrink: 0,
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  dbGreen: {color: GREEN},
  dbAmber: {color: AMBER},
  // Amber potential-conflict result row: tinted wash, amber left rule.
  hitRow: {
    borderRadius: 'var(--radius-container)',
    backgroundColor: AMBER_WASH,
    borderLeft: \`3px solid \${AMBER}\`,
    padding: 'var(--spacing-2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  hitTitleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
  },
  hitTitleText: {minWidth: 0},
  hitIcon: {color: AMBER, flexShrink: 0, paddingTop: 1},
  // Green all-clear surface for the cleared specimen.
  clearRow: {
    borderRadius: 'var(--radius-container)',
    backgroundColor: GREEN_WASH,
    borderLeft: \`3px solid \${GREEN}\`,
    padding: 'var(--spacing-2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  clearIcon: {color: GREEN, flexShrink: 0, paddingTop: 1},
  // Relationship diagram mini: fixed-aspect inline SVG on token colors.
  diagramWrap: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-1)',
  },
  diagramSvg: {display: 'block', width: '100%', height: 'auto'},
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    color: 'var(--color-text-secondary)',
  },
  disclosureText: {minWidth: 0, flex: '1 1 160px'},
  scanBarWrap: {marginTop: 4},
};


// ============= SHARED SPECIMEN BITS =============

/**
 * Specimen wrapper: mono state-id Token + one-line note ABOVE the card,
 * per the composer-state-gallery caption idiom.
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
      {children}
    </section>
  );
}

/**
 * Card header shared by all three states: sparkle mark + product label,
 * matter name, intake meta, run timestamp, and the work-product privilege
 * line. Identical across specimens so geometry stays registered.
 */
function CardHeader() {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <span style={styles.aiMark} aria-hidden>
          <Icon icon={SparklesIcon} size="sm" color="inherit" />
        </span>
        <StackItem size="fill">
          <Text type="supporting" size="xsm" color="secondary">
            {INTAKE.product}
          </Text>
        </StackItem>
        <Token label={INTAKE.matterNo} size="sm" color="gray" />
      </HStack>
      <VStack gap={1}>
        <Heading level={2}>{INTAKE.matterName}</Heading>
        <Text type="supporting" size="xsm" color="secondary">
          {INTAKE.matterStage} · {INTAKE.requestedBy}
        </Text>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {INTAKE.runStamp}
        </Text>
      </VStack>
      <div style={styles.privilegeRow}>
        <Icon icon={LockIcon} size="xsm" color="inherit" />
        <Text type="supporting" size="xsm" color="secondary">
          {INTAKE.privilege}
        </Text>
      </div>
    </VStack>
  );
}

/** Matter-party list: name pinned, role wraps, per the caption-row rule. */
function PartiesSection() {
  return (
    <VStack gap={1}>
      <Text type="body" size="sm" weight="bold">
        Matter parties
      </Text>
      <VStack gap={0}>
        {PARTIES.map(party => (
          <div key={party.name} style={styles.partyRow}>
            <span style={styles.partyName}>
              <Text type="body" size="sm" weight="medium">
                {party.name}
              </Text>
            </span>
            <span style={styles.partyRole}>
              <Text type="supporting" size="xsm" color="secondary">
                {party.role}
              </Text>
            </span>
          </div>
        ))}
      </VStack>
    </VStack>
  );
}

/**
 * Per-database progress rows. Complete rows get a green check, the
 * candidate row an amber alert glyph, and the scanning row a Spinner plus
 * a determinate ProgressBar frozen at the fixture's 64%.
 */
function DatabaseRows({rows}: {rows: DbRow[]}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <Icon icon={DatabaseIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="body" size="sm" weight="bold">
            Databases checked
          </Text>
        </StackItem>
      </HStack>
      <VStack gap={0}>
        {rows.map(row => (
          <div key={row.id} style={styles.dbRow}>
            <span
              style={{
                ...styles.dbIconSlot,
                ...(row.state === 'candidate' ? styles.dbAmber : styles.dbGreen),
              }}>
              {row.state === 'scanning' ? (
                <Spinner size="sm" aria-label={\`Scanning \${row.label}\`} />
              ) : (
                <Icon
                  icon={row.state === 'candidate' ? TriangleAlertIcon : CheckIcon}
                  size="sm"
                  color="inherit"
                />
              )}
            </span>
            <div style={styles.dbBody}>
              <VStack gap={0}>
                <Text type="body" size="sm">
                  {row.label}
                </Text>
                <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                  {row.detail}
                </Text>
                {row.state === 'scanning' ? (
                  <div style={styles.scanBarWrap}>
                    <ProgressBar
                      label={SCAN_PROGRESS.label}
                      value={SCAN_PROGRESS.value}
                      isLabelHidden
                    />
                  </div>
                ) : null}
              </VStack>
            </div>
            <span style={styles.dbRecords}>
              <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                {row.records}
              </Text>
            </span>
          </div>
        ))}
      </VStack>
    </VStack>
  );
}


/**
 * Suite-wide AI disclosure line: sparkle glyph in the Casewright purple +
 * "AI-generated · verify before relying" in small secondary text. One
 * shared treatment across the whole Legal AI suite.
 */
function DisclosureFooter() {
  return (
    <VStack gap={2}>
      <Divider />
      <div style={styles.footerRow}>
        <span style={{color: AI_ACCENT, display: 'inline-flex'}} aria-hidden>
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

/**
 * Relationship diagram mini: three nodes — the new matter (top left), the
 * closed 2019 matter (top right), and Meridian Growth Partners (bottom
 * center, amber-flagged) — with labeled edges to each matter. Inline SVG on
 * token colors; viewBox-scaled so it shrinks with the card.
 */
function RelationshipDiagram() {
  const nodeFill = 'var(--color-background-card)';
  const nodeStroke = 'var(--color-border)';
  const titleFill = 'var(--color-text-primary)';
  const subFill = 'var(--color-text-secondary)';
  return (
    <div style={styles.diagramWrap}>
      <svg
        viewBox="0 0 360 112"
        style={styles.diagramSvg}
        role="img"
        aria-label={DIAGRAM.ariaLabel}>
        {/* Edges first so nodes paint over the line ends. */}
        <line x1={140} y1={68} x2={82} y2={44} stroke={nodeStroke} strokeWidth={1.5} />
        <line x1={220} y1={68} x2={278} y2={44} stroke={nodeStroke} strokeWidth={1.5} />
        <text x={104} y={66} textAnchor="end" fontSize={9} fill={subFill}>
          {DIAGRAM.edgeAB}
        </text>
        <text x={256} y={66} textAnchor="start" fontSize={9} fill={subFill}>
          {DIAGRAM.edgeBC}
        </text>
        {/* Node A: the new matter. */}
        <rect x={6} y={6} width={152} height={38} rx={8} fill={nodeFill} stroke={nodeStroke} />
        <text x={82} y={22} textAnchor="middle" fontSize={10} fontWeight={600} fill={titleFill}>
          {DIAGRAM.nodeA.title}
        </text>
        <text x={82} y={35} textAnchor="middle" fontSize={8.5} fill={subFill}>
          {DIAGRAM.nodeA.sub}
        </text>
        {/* Node C: the closed adverse matter. */}
        <rect x={202} y={6} width={152} height={38} rx={8} fill={nodeFill} stroke={nodeStroke} />
        <text x={278} y={22} textAnchor="middle" fontSize={10} fontWeight={600} fill={titleFill}>
          {DIAGRAM.nodeC.title}
        </text>
        <text x={278} y={35} textAnchor="middle" fontSize={8.5} fill={subFill}>
          {DIAGRAM.nodeC.sub}
        </text>
        {/* Node B: the flagged shared party, amber-strapped. */}
        <rect
          x={104}
          y={68}
          width={152}
          height={38}
          rx={8}
          style={{fill: AMBER_WASH, stroke: AMBER}}
          strokeWidth={1.5}
        />
        <text x={180} y={84} textAnchor="middle" fontSize={10} fontWeight={600} fill={titleFill}>
          {DIAGRAM.nodeB.title}
        </text>
        <text x={180} y={97} textAnchor="middle" fontSize={8.5} fill={subFill}>
          {DIAGRAM.nodeB.sub}
        </text>
      </svg>
    </div>
  );
}

// ============= SPECIMENS =============

/**
 * Specimen 01 — running: parties listed, clients and adverse parties
 * complete (the adverse pass already holding its one candidate), related
 * entities still scanning behind a frozen 64% bar. Every action is locked
 * until the run completes.
 */
function RunningSpecimen() {
  return (
    <Specimen
      stateId="01 · running"
      note="Mid-run: two passes complete, related entities still scanning at 8,014 of 12,467.">
      <Card padding={3}>
        <VStack gap={3}>
          <CardHeader />
          <Divider />
          <PartiesSection />
          <Divider />
          <DatabaseRows rows={DB_ROWS_RUNNING} />
          <Text type="supporting" size="xsm" color="secondary">
            {RUNNING_NOTE}
          </Text>
          <div style={styles.actionRow}>
            <Button
              label="Escalate to ethics"
              size="sm"
              variant="secondary"
              isDisabled
              icon={<Icon icon={ScaleIcon} size="sm" color="inherit" />}
              onClick={() => {}}
            />
            <Button
              label="Propose screen team"
              size="sm"
              variant="ghost"
              isDisabled
              icon={<Icon icon={ShieldIcon} size="sm" color="inherit" />}
              onClick={() => {}}
            />
          </div>
          <DisclosureFooter />
        </VStack>
      </Card>
    </Specimen>
  );
}

/**
 * Specimen 02 — potential conflict: the amber Meridian Growth Partners
 * result row with match-basis chips, the three-node relationship diagram,
 * an honest confidence band, the no-waiver chip, and the escalate /
 * screen-team affordances (each resolves to a confirmation chip locally).
 */
function PotentialConflictSpecimen() {
  const [isEscalated, setIsEscalated] = useState(false);
  const [isScreenProposed, setIsScreenProposed] = useState(false);
  return (
    <Specimen
      stateId="02 · potential-conflict"
      note="One adverse-party hit pending human clearance — no waiver on file.">
      <Card padding={3}>
        <VStack gap={3}>
          <CardHeader />
          <Divider />
          <div style={styles.metaRow}>
            <Text type="body" size="sm" weight="bold">
              Result
            </Text>
            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
              3 databases · 17,847 records · 1 potential conflict
            </Text>
          </div>
          <div style={styles.hitRow}>
            <div style={styles.hitTitleRow}>
              <span style={styles.hitIcon}>
                <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
              </span>
              <div style={styles.hitTitleText}>
                <VStack gap={0}>
                  <Text type="body" size="sm" weight="medium">
                    {HIT.party}
                  </Text>
                  <Text type="supporting" size="xsm" color="secondary">
                    {HIT.basis}
                  </Text>
                </VStack>
              </div>
            </div>
            <div style={styles.metaRow}>
              <Token label={HIT.matterChip} size="sm" color="gray" />
              <Token label="Closed Nov 2019" size="sm" color="default" />
              <Token
                label={HIT.waiver}
                size="sm"
                color="orange"
                icon={<Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />}
              />
              <Token label={HIT.clearanceState} size="sm" color="orange" />
            </div>
            <Text type="supporting" size="xsm" color="secondary">
              {HIT.matterDetail} · {HIT.closedDetail}
            </Text>
            <Text type="supporting" size="xsm" color="secondary">
              {HIT.confidence}
            </Text>
          </div>
          <VStack gap={1}>
            <Text type="body" size="sm" weight="bold">
              Relationship
            </Text>
            <RelationshipDiagram />
          </VStack>
          <div style={styles.actionRow}>
            {isEscalated ? (
              <Token
                label="Escalated to ethics · pending review"
                size="sm"
                color="orange"
                icon={<Icon icon={CheckIcon} size="xsm" color="inherit" />}
              />
            ) : (
              <Button
                label="Escalate to ethics"
                size="sm"
                variant="secondary"
                icon={<Icon icon={ScaleIcon} size="sm" color="inherit" />}
                onClick={() => setIsEscalated(true)}
              />
            )}
            {isScreenProposed ? (
              <Token
                label="Screen team proposed"
                size="sm"
                color="gray"
                icon={<Icon icon={ShieldIcon} size="xsm" color="inherit" />}
              />
            ) : (
              <Button
                label="Propose screen team"
                size="sm"
                variant="ghost"
                icon={<Icon icon={ShieldIcon} size="sm" color="inherit" />}
                onClick={() => setIsScreenProposed(true)}
              />
            )}
          </div>
          <DisclosureFooter />
        </VStack>
      </Card>
    </Specimen>
  );
}

/**
 * Specimen 03 — cleared: green all-clear with the checked-databases
 * summary (the adverse row carrying Ruth Vega's cleared-hit note), the
 * completion timestamp, her clearance provenance with the waiver memo, and
 * the Log-to-matter-file action resolving to a confirmation chip.
 */
function ClearedSpecimen() {
  const [isLogged, setIsLogged] = useState(false);
  return (
    <Specimen
      stateId="03 · cleared"
      note="All passes green after Ruth Vega's Jul 14 clearance and waiver memo.">
      <Card padding={3}>
        <VStack gap={3}>
          <CardHeader />
          <Divider />
          <div style={styles.clearRow}>
            <div style={styles.hitTitleRow}>
              <span style={styles.clearIcon}>
                <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
              </span>
              <div style={styles.hitTitleText}>
                <VStack gap={0}>
                  <Text type="body" size="sm" weight="medium">
                    {CLEARED.headline}
                  </Text>
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    {CLEARED.completed}
                  </Text>
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    {CLEARED.summary}
                  </Text>
                </VStack>
              </div>
            </div>
          </div>
          <DatabaseRows rows={DB_ROWS_CLEARED} />
          <VStack gap={1}>
            <div style={styles.metaRow}>
              <Token
                label={CLEARED.clearance}
                size="sm"
                color="green"
                icon={<Icon icon={CheckIcon} size="xsm" color="inherit" />}
              />
            </div>
            <Text type="supporting" size="xsm" color="secondary">
              {CLEARED.memo}
            </Text>
            <div style={styles.metaRow}>
              <Button
                label="View waiver memo"
                size="sm"
                variant="ghost"
                icon={<Icon icon={ArrowUpRightIcon} size="sm" color="inherit" />}
                onClick={() => {}}
              />
            </div>
          </VStack>
          <div style={styles.actionRow}>
            {isLogged ? (
              <Token
                label={CLEARED.loggedChip}
                size="sm"
                color="green"
                icon={<Icon icon={CheckIcon} size="xsm" color="inherit" />}
              />
            ) : (
              <Button
                label="Log to matter file"
                size="sm"
                variant="secondary"
                icon={<Icon icon={FileCheck2Icon} size="sm" color="inherit" />}
                onClick={() => setIsLogged(true)}
              />
            )}
          </div>
          <DisclosureFooter />
        </VStack>
      </Card>
    </Specimen>
  );
}




// ============= PAGE =============

export default function ConflictCheckCardTemplate() {
  return (
    <div style={styles.stage}>
      <header style={styles.stageHeader}>
        <VStack gap={1}>
          <Heading level={1}>Conflicts check card</Heading>
          <Text type="supporting" color="secondary">
            The Casewright new-matter conflicts run for the Kestrel Labs
            Series C — running, potential-conflict, and cleared states,
            frozen side by side.
          </Text>
        </VStack>
      </header>
      <div style={styles.specimenRow}>
        <RunningSpecimen />
        <PotentialConflictSpecimen />
        <ClearedSpecimen />
      </div>
    </div>
  );
}
`;export{e as default};