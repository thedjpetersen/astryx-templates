var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (token-allocation categories summing to
 *   32,000 of a 200,000-token window, fixed per-turn payload rows, context
 *   file and skill estimates with "~" prefixes, per-model session cost rows)
 * @output Focused context-window manager panel (~720px centered column):
 *   a stacked 5-segment allocation meter with a movable compaction-boundary
 *   tick and legend; collapsible LOADED EVERY TURN / THIS SESSION sections
 *   with per-row mini ProgressBars and fixed-cost footers; CONTEXT FILES and
 *   SKILLS sections with chevron rows, "Show N more" expanders, and an
 *   estimate footnote; a compaction-boundary Slider (10-90%) with a "Set as
 *   default" action; and a session expense card — five partially lit $
 *   glyphs plus a per-model cost mini-table with tabular numbers
 * @position Page template; emitted by \`astryx template ai-chat-context-manager\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (panel title,
 * session name, refresh action). LayoutContent scrolls a single centered
 * column of Cards — no side panels: unlike ai-chat-tool-stream this surface
 * is about *what fills the window*, not the conversation itself.
 *
 * Responsive contract:
 * - Single column, maxWidth 720, centered; mobile-first — no breakpoint
 *   logic needed (rows wrap their metadata, the meter and slider are fluid).
 * - Mini ProgressBars keep a fixed 88px track so token columns align; the
 *   labels truncate first (maxLines={1}) when space runs out.
 * - The legend and expense table stack naturally at narrow widths (legend
 *   wraps; the table's proportional column absorbs the squeeze).
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Slider} from '@astryxdesign/core/Slider';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {
  ChevronRightIcon,
  FileTextIcon,
  RefreshCwIcon,
  SparklesIcon,
} from 'lucide-react';

// ============= STYLES =============

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

const styles: Record<string, CSSProperties> = {
  // Single centered panel column; LayoutContent owns scrolling.
  column: {
    maxWidth: 720,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-4)',
  },
  // Stacked allocation meter: 5 colored segments over a muted track, with
  // a positioned compaction-boundary tick driven by the slider value.
  meterTrack: {
    position: 'relative',
    display: 'flex',
    height: 14,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  meterSegment: {height: '100%'},
  boundaryTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'var(--color-text-secondary)',
    opacity: 0.7,
  },
  legendWrap: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  legendChip: {
    width: 10,
    height: 10,
    borderRadius: 3,
    flexShrink: 0,
  },
  // Uppercase 11px tracking-wide section eyebrows (density motif).
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  sectionChevron: {
    display: 'inline-flex',
    transition: 'transform 0.15s ease',
  },
  sectionChevronOpen: {transform: 'rotate(90deg)'},
  rowLabelCell: {minWidth: 0},
  miniBar: {width: 88, flexShrink: 0},
  tokenCell: {width: 52, textAlign: 'right', flexShrink: 0},
  sectionRow: {paddingBlock: 'var(--spacing-1)'},
  // Chevron rows in CONTEXT FILES / SKILLS read as clickable drill-ins.
  drillRow: {
    paddingBlock: 'var(--spacing-1)',
    cursor: 'pointer',
  },
  footnote: {paddingTop: 'var(--spacing-1)'},
  // Expense scale: five $ glyphs, lit vs unlit.
  dollarGlyph: {
    fontFamily: MONO,
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
    color: 'var(--color-border-emphasized)',
  },
  dollarGlyphLit: {color: 'var(--color-accent)'},
};

// ============= DATA =============
// Deterministic fixtures: fixed token counts, no clocks, no randomness.
// Category tokens sum to 32,000 of a 200,000-token window (16% used).

const SESSION_TITLE = 'checkout-service latency triage';
const CONTEXT_WINDOW = 200000;
const CONTEXT_USED = 32000;
const CONTEXT_USED_PCT = 16;

type SegmentVariant = 'accent' | 'success' | 'warning' | 'neutral' | 'error';

// Segment fill colors for the custom stacked bar (ProgressBar variants
// cover the per-row mini bars; the stacked meter needs raw tokens).
const SEGMENT_COLOR: Record<SegmentVariant, string> = {
  neutral: 'var(--color-border-emphasized)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  accent: 'var(--color-accent)',
};

const METER_SEGMENTS: ReadonlyArray<{
  id: string;
  label: string;
  tokens: number;
  display: string;
  variant: SegmentVariant;
}> = [
  {id: 'system', label: 'System', tokens: 9400, display: '9.4K', variant: 'neutral'},
  {
    id: 'files',
    label: 'Context files',
    tokens: 8200,
    display: '8.2K',
    variant: 'success',
  },
  {id: 'skills', label: 'Skills', tokens: 4600, display: '4.6K', variant: 'warning'},
  {
    id: 'tools',
    label: 'Tool results',
    tokens: 5400,
    display: '5.4K',
    variant: 'error',
  },
  {
    id: 'messages',
    label: 'Messages',
    tokens: 4400,
    display: '4.4K',
    variant: 'accent',
  },
];

interface MeteredRow {
  id: string;
  label: string;
  detail?: string;
  tokens: number;
  display: string;
  variant: SegmentVariant;
}

// Fixed per-turn payload: sums to 9.4K (5% of the window).
const EVERY_TURN_ROWS: MeteredRow[] = [
  {
    id: 'sys-prompt',
    label: 'System prompt',
    tokens: 3100,
    display: '3.1K',
    variant: 'neutral',
  },
  {
    id: 'tool-defs',
    label: 'Tool definitions',
    detail: '14 tools',
    tokens: 2800,
    display: '2.8K',
    variant: 'neutral',
  },
  {
    id: 'memory',
    label: 'Memory file',
    detail: 'memory/MEMORY.md',
    tokens: 2400,
    display: '2.4K',
    variant: 'neutral',
  },
  {
    id: 'rules',
    label: 'Workspace rules',
    tokens: 1100,
    display: '1.1K',
    variant: 'neutral',
  },
];

// Conversation payload accrued this session: sums to 9.8K.
const SESSION_ROWS: MeteredRow[] = [
  {
    id: 'msgs',
    label: 'Messages',
    detail: '18 turns',
    tokens: 3200,
    display: '3.2K',
    variant: 'accent',
  },
  {
    id: 'thinking',
    label: 'Thinking blocks',
    detail: '6 kept',
    tokens: 1200,
    display: '1.2K',
    variant: 'accent',
  },
  {
    id: 'tool-results',
    label: 'Tool results',
    detail: '23 calls',
    tokens: 5400,
    display: '5.4K',
    variant: 'error',
  },
];

interface EstimatedRow {
  id: string;
  name: string;
  detail: string;
  display: string; // "~" prefix — estimates, see footnote
}

// Context files: 7 rows summing to ~8.2K; 3 visible + "Show 4 more".
const CONTEXT_FILE_ROWS: EstimatedRow[] = [
  {
    id: 'cf-1',
    name: 'memory/MEMORY.md',
    detail: 'Pinned · updated Jul 11',
    display: '~2.1K',
  },
  {
    id: 'cf-2',
    name: 'notes/latency-runbook.md',
    detail: 'Attached by you · Jul 12',
    display: '~1.6K',
  },
  {
    id: 'cf-3',
    name: 'src/api/checkout/routes.ts',
    detail: 'Read by agent · turn 6',
    display: '~1.4K',
  },
  {
    id: 'cf-4',
    name: 'docs/architecture.md',
    detail: 'Read by agent · turn 9',
    display: '~1.2K',
  },
  {
    id: 'cf-5',
    name: '.env.example',
    detail: 'Read by agent · turn 9',
    display: '~0.8K',
  },
  {
    id: 'cf-6',
    name: 'package.json',
    detail: 'Read by agent · turn 3',
    display: '~0.6K',
  },
  {
    id: 'cf-7',
    name: 'scripts/load-test.sh',
    detail: 'Read by agent · turn 11',
    display: '~0.5K',
  },
];

// Skills: 5 rows summing to ~4.6K; 3 visible + "Show 2 more".
const SKILL_ROWS: EstimatedRow[] = [
  {
    id: 'sk-1',
    name: 'perf-profiler',
    detail: 'Loaded · turn 4',
    display: '~1.4K',
  },
  {
    id: 'sk-2',
    name: 'trace-reader',
    detail: 'Loaded · turn 5',
    display: '~1.1K',
  },
  {
    id: 'sk-3',
    name: 'pr-review',
    detail: 'Preloaded · workspace default',
    display: '~0.9K',
  },
  {
    id: 'sk-4',
    name: 'sql-linter',
    detail: 'Preloaded · workspace default',
    display: '~0.7K',
  },
  {
    id: 'sk-5',
    name: 'changelog-writer',
    detail: 'Preloaded · workspace default',
    display: '~0.5K',
  },
];

const VISIBLE_ROW_CAP = 3;

const DEFAULT_COMPACTION_PCT = 70;

// Session expense: 1.2M model-weighted tokens, $3.22 est. — lights 2 of 5
// glyphs on the five-$ scale (each glyph ≈ $2 of session spend).
const DOLLARS_LIT = 2;
const DOLLAR_SCALE = [0, 1, 2, 3, 4];

interface ModelCostRow extends Record<string, unknown> {
  id: string;
  model: string;
  tokens: string;
  cost: string;
}

const MODEL_COST_ROWS: ModelCostRow[] = [
  {id: 'mc-1', model: 'cascade-flash', tokens: '730K', cost: '$0.44'},
  {id: 'mc-2', model: 'cascade-pro', tokens: '412K', cost: '$1.86'},
  {id: 'mc-3', model: 'cascade-reason', tokens: '58K', cost: '$0.92'},
];

const MODEL_COST_COLUMNS: TableColumn<ModelCostRow>[] = [
  {
    key: 'model',
    header: 'Model',
    width: proportional(1),
    renderCell: row => (
      <Text type="code" size="sm">
        {row.model}
      </Text>
    ),
  },
  {
    key: 'tokens',
    header: 'Tokens',
    width: pixel(96),
    align: 'end',
    renderCell: row => (
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {row.tokens}
      </Text>
    ),
  },
  {
    key: 'cost',
    header: 'Est. cost',
    width: pixel(96),
    align: 'end',
    renderCell: row => (
      <Text type="supporting" hasTabularNumbers>
        {row.cost}
      </Text>
    ),
  },
];

// ============= SECTION SHELL =============

/**
 * Collapsible section with the uppercase eyebrow header, a rotating
 * chevron, and a right-aligned total. All four token sections share it.
 */
function PanelSection({
  title,
  total,
  defaultIsOpen = true,
  children,
}: {
  title: string;
  total: string;
  defaultIsOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  return (
    <Card padding={3}>
      <Collapsible
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        trigger={
          <HStack gap={2} vAlign="center">
            <span
              style={{
                ...styles.sectionChevron,
                ...(isOpen ? styles.sectionChevronOpen : undefined),
              }}>
              <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
            </span>
            <StackItem size="fill">
              <span style={styles.eyebrow}>{title}</span>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {total}
            </Text>
          </HStack>
        }>
        {children}
      </Collapsible>
    </Card>
  );
}

/** Label + token count + mini ProgressBar row (fixed / session payloads). */
function MeteredRowItem({row}: {row: MeteredRow}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.sectionRow}>
      <StackItem size="fill" style={styles.rowLabelCell}>
        <HStack gap={2} vAlign="center">
          <Text type="supporting" maxLines={1}>
            {row.label}
          </Text>
          {row.detail != null && (
            <Text type="supporting" size="sm" color="secondary" maxLines={1}>
              {row.detail}
            </Text>
          )}
        </HStack>
      </StackItem>
      <div style={styles.tokenCell}>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {row.display}
        </Text>
      </div>
      <div style={styles.miniBar}>
        <ProgressBar
          value={row.tokens}
          max={CONTEXT_USED}
          label={\`\${row.label} share of used context\`}
          isLabelHidden
          variant={row.variant}
        />
      </div>
    </HStack>
  );
}

/**
 * Chevron drill-in row for CONTEXT FILES / SKILLS: icon, mono name,
 * provenance detail, "~"-prefixed estimate, trailing chevron. Reads as
 * clickable (opening the source would leave this panel).
 */
function EstimatedRowItem({
  row,
  icon,
}: {
  row: EstimatedRow;
  icon: typeof FileTextIcon;
}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.drillRow}>
      <Icon icon={icon} size="sm" color="secondary" />
      <StackItem size="fill" style={styles.rowLabelCell}>
        <VStack gap={0}>
          <Text type="code" size="sm" maxLines={1}>
            {row.name}
          </Text>
          <Text type="supporting" size="sm" color="secondary" maxLines={1}>
            {row.detail}
          </Text>
        </VStack>
      </StackItem>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {row.display}
      </Text>
      <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
    </HStack>
  );
}

/** Estimated section body: capped rows + "Show N more" expander. */
function EstimatedRowList({
  rows,
  icon,
  moreLabel,
}: {
  rows: EstimatedRow[];
  icon: typeof FileTextIcon;
  moreLabel: string;
}) {
  const [showsAll, setShowsAll] = useState(false);
  const visible = showsAll ? rows : rows.slice(0, VISIBLE_ROW_CAP);
  const hiddenCount = rows.length - VISIBLE_ROW_CAP;
  return (
    <VStack gap={0}>
      {visible.map((row, index) => (
        <VStack key={row.id} gap={0}>
          <EstimatedRowItem row={row} icon={icon} />
          {index < visible.length - 1 && <Divider />}
        </VStack>
      ))}
      {!showsAll && hiddenCount > 0 && (
        <HStack gap={2}>
          <Button
            label={\`Show \${hiddenCount} more\`}
            variant="ghost"
            size="sm"
            onClick={() => setShowsAll(true)}
          />
        </HStack>
      )}
      <div style={styles.footnote}>
        <Text type="supporting" size="sm" color="secondary">
          {moreLabel}
        </Text>
      </div>
    </VStack>
  );
}

// ============= PAGE =============

export default function AiChatContextManagerTemplate() {
  const [compactionPct, setCompactionPct] = useState(DEFAULT_COMPACTION_PCT);

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Context window</Heading>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {SESSION_TITLE}
                </Text>
              </VStack>
            </StackItem>
            <Button
              label="Refresh estimates"
              variant="ghost"
              size="sm"
              icon={<Icon icon={RefreshCwIcon} size="sm" color="inherit" />}
              onClick={() => {}}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={3}>
              {/* ===== The meter: stacked category bar + legend ===== */}
              <Card padding={3}>
                <VStack gap={2}>
                  <div style={styles.meterTrack}>
                    {METER_SEGMENTS.map(segment => (
                      <div
                        key={segment.id}
                        style={{
                          ...styles.meterSegment,
                          width: \`\${(segment.tokens / CONTEXT_WINDOW) * 100}%\`,
                          backgroundColor: SEGMENT_COLOR[segment.variant],
                        }}
                        title={\`\${segment.label} · \${segment.display} tokens\`}
                      />
                    ))}
                    <div
                      style={{
                        ...styles.boundaryTick,
                        left: \`\${compactionPct}%\`,
                      }}
                      aria-hidden
                    />
                  </div>
                  <HStack gap={3} vAlign="center" style={styles.legendWrap}>
                    {METER_SEGMENTS.map(segment => (
                      <HStack key={segment.id} gap={1} vAlign="center">
                        <span
                          style={{
                            ...styles.legendChip,
                            backgroundColor: SEGMENT_COLOR[segment.variant],
                          }}
                          aria-hidden
                        />
                        <Text type="supporting" size="sm" color="secondary">
                          {segment.label}
                        </Text>
                        <Text
                          type="supporting"
                          size="sm"
                          color="secondary"
                          hasTabularNumbers>
                          {segment.display}
                        </Text>
                      </HStack>
                    ))}
                  </HStack>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {\`32k / 200k tokens (\${CONTEXT_USED_PCT}%) · compaction at \${compactionPct}%\`}
                  </Text>
                </VStack>
              </Card>

              {/* ===== Fixed payload ===== */}
              <PanelSection title="Loaded every turn" total="9.4K">
                <VStack gap={0}>
                  {EVERY_TURN_ROWS.map(row => (
                    <MeteredRowItem key={row.id} row={row} />
                  ))}
                  <Divider />
                  <div style={styles.footnote}>
                    <Text type="supporting" size="sm" color="secondary">
                      Fixed: 9.4K (5%) — sent with every request; compaction
                      never touches these.
                    </Text>
                  </div>
                </VStack>
              </PanelSection>

              {/* ===== Conversation payload ===== */}
              <PanelSection title="This session" total="9.8K">
                <VStack gap={0}>
                  {SESSION_ROWS.map(row => (
                    <MeteredRowItem key={row.id} row={row} />
                  ))}
                  <Divider />
                  <div style={styles.footnote}>
                    <Text type="supporting" size="sm" color="secondary">
                      Grows every turn; oldest turns are summarized first at
                      the compaction boundary.
                    </Text>
                  </div>
                </VStack>
              </PanelSection>

              {/* ===== Context files ===== */}
              <PanelSection title="Context files" total="~8.2K">
                <EstimatedRowList
                  rows={CONTEXT_FILE_ROWS}
                  icon={FileTextIcon}
                  moreLabel="~ Estimated — not yet refined with API token counts."
                />
              </PanelSection>

              {/* ===== Skills ===== */}
              <PanelSection title="Skills" total="~4.6K">
                <EstimatedRowList
                  rows={SKILL_ROWS}
                  icon={SparklesIcon}
                  moreLabel="~ Estimated — not yet refined with API token counts."
                />
              </PanelSection>

              {/* ===== Compaction boundary ===== */}
              <Card padding={3}>
                <VStack gap={2}>
                  <span style={styles.eyebrow}>Compaction boundary</span>
                  <Slider
                    label="Compaction boundary"
                    isLabelHidden
                    min={10}
                    max={90}
                    step={5}
                    value={compactionPct}
                    onChange={setCompactionPct}
                    valueDisplay="text"
                    formatValue={value => \`\${value}%\`}
                    marks={[
                      {value: 10, label: '10%'},
                      {value: 50, label: '50%'},
                      {value: 90, label: '90%'},
                    ]}
                  />
                  <Text type="supporting" color="secondary">
                    When usage crosses this line, older turns are summarized
                    into a compact digest so the session can keep going.
                    Lower values compact sooner and cost less; higher values
                    keep more raw history in the window.
                  </Text>
                  <HStack gap={2} vAlign="center">
                    <Button
                      label="Set as default"
                      variant="secondary"
                      size="sm"
                      onClick={() => {}}
                    />
                    <Text type="supporting" size="sm" color="secondary">
                      Workspace default: 70%
                    </Text>
                  </HStack>
                </VStack>
              </Card>

              {/* ===== Session expense ===== */}
              <Card padding={3}>
                <VStack gap={2}>
                  <span style={styles.eyebrow}>Session expense</span>
                  <HStack gap={1} vAlign="center">
                    {DOLLAR_SCALE.map(index => (
                      <span
                        key={index}
                        style={{
                          ...styles.dollarGlyph,
                          ...(index < DOLLARS_LIT
                            ? styles.dollarGlyphLit
                            : undefined),
                        }}
                        aria-hidden>
                        $
                      </span>
                    ))}
                    <Text type="supporting" color="secondary">
                      (2 of 5)
                    </Text>
                  </HStack>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    Session so far · rough model-weighted estimate · 1.2M
                    tokens
                  </Text>
                  <Table
                    data={MODEL_COST_ROWS}
                    columns={MODEL_COST_COLUMNS}
                    idKey="id"
                    density="compact"
                    dividers="rows"
                  />
                </VStack>
              </Card>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};