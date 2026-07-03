var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (markdown prose, SQL source + captured
 *   result rows, weekly activation series, step-conversion table rows)
 * @output Notebook / report page: pinned report header (title, status badge,
 *   author, Timestamp, kernel status, Run all) above a centered document
 *   column of sequential blocks — Markdown prose, a SQL CodeBlock with a
 *   rendered result output beneath it, a two-series line chart block, and a
 *   step-conversion data table block. Each block sits in a subtle frame with
 *   a hover-revealed floating toolbar (run / edit + MoreMenu) and a run
 *   provenance footer; Run and Run all bump deterministic run numbers, and
 *   the MoreMenu can hide/show a block's output.
 * @position Page template; emitted by \`astryx template notebook-report\`
 *
 * Responsive contract:
 * - Document column: max-width 840px, centered; below that the column keeps
 *   page padding and takes full width. Blocks never exceed the column.
 * - Header: title row keeps the Run all action pinned right; the kernel
 *   status line hides below 720px; the author/timestamp meta row wraps.
 * - Block toolbars: revealed on hover or focus-within on hover-capable
 *   pointers as a floating top-right overlay; on touch devices
 *   ("(hover: none)") the toolbar instead sits in flow as a right-aligned
 *   row at the top of the block — so it never covers the CodeBlock's own
 *   copy button or block content — and its run/edit and menu controls
 *   grow from the 28px "sm" chrome to 40px tap targets.
 * - Code and captured result output scroll horizontally inside the block
 *   frame; the chart scales to column width at a fixed height; table pixel
 *   columns keep numeric cells stable while the step column absorbs width.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Markdown} from '@astryxdesign/core/Markdown';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import type {DropdownMenuOption} from '@astryxdesign/core/DropdownMenu';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ChartV2 as Chart,
  ChartGrid,
  ChartAxis,
  line,
} from '@astryxdesign/lab';
import {PlayIcon, SquarePenIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered report column; page padding comes from LayoutContent.
  document: {maxWidth: 840, margin: '0 auto', width: '100%'},
  // Subtle block frame — hover swaps the border to the emphasized token.
  block: {
    position: 'relative',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
  },
  blockHovered: {
    borderColor: 'var(--color-border-emphasized)',
  },
  // Floating block toolbar, pinned to the frame's top-right corner.
  blockToolbar: {
    position: 'absolute',
    top: 'var(--spacing-2)',
    right: 'var(--spacing-2)',
    zIndex: 1,
    display: 'flex',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-1)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    opacity: 0,
    transition: 'opacity 120ms ease',
    pointerEvents: 'none',
  },
  blockToolbarVisible: {opacity: 1, pointerEvents: 'auto'},
  // Touch devices: the toolbar sits in flow at the top of the block (a
  // right-aligned row) instead of overlaying it, so it never covers the
  // CodeBlock's copy button or the top-right of block content.
  blockToolbarRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-2) var(--spacing-2) 0',
  },
  // Touch devices: grow the "sm" 28px toolbar controls to 40px tap
  // targets (icon glyphs stay "sm" so the toolbar reads the same).
  iconTapTarget: {width: 40, height: 40},
  // Prose / titled block body padding.
  blockBody: {padding: 'var(--spacing-4)'},
  // Rendered output area beneath a block's input.
  blockOutput: {
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    borderBottomLeftRadius: 'var(--radius-container)',
    borderBottomRightRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    overflowX: 'auto',
  },
  // Captured query result rows — monospace, preformatted, scrolls in x.
  resultText: {
    margin: 0,
    fontFamily: 'var(--font-family-code)',
    fontSize: 'var(--font-size-sm)',
    lineHeight: 'var(--text-supporting-leading)',
    whiteSpace: 'pre',
  },
  // Run provenance footer under a runnable block.
  blockFooter: {
    borderTop: '1px solid var(--color-border)',
    padding: 'var(--spacing-1) var(--spacing-4)',
  },
  // Numeric table cells use tabular numerals so digit columns stay aligned.
  numericCell: {fontVariantNumeric: 'tabular-nums'},
  // Keep the chart from collapsing when the column narrows.
  chartBody: {minWidth: 0},
};

// Chart series colors via Astryx design tokens (CSS custom properties)
const chartColors = {
  selfServe: 'var(--color-data-categorical-blue, #0171E3)',
  salesAssisted: 'var(--color-data-categorical-green, #0B991F)',
};

// ============= DATA =============

const REPORT = {
  title: 'Activation funnel review — June 2026',
  status: 'Published',
  author: 'Elena Vasquez',
  team: 'Growth analytics',
  // Fixed ISO string keeps the Timestamp deterministic.
  publishedAt: '2026-06-29T16:42:00Z',
  kernel: 'prod-warehouse · idle',
};

const SUMMARY_MARKDOWN = \`## Summary

Week-one activation for June signups landed at **41.8%**, up 3.2 points
from May. The gain is concentrated in self-serve teams that reached the
*invite a teammate* step within their first session.

Method notes:

- Activation = workspace runs **3+ reports** within 7 days of signup.
- Cohorts are keyed to the Monday of the signup week (W22–W26).
- Sales-assisted workspaces exclude trials converted before onboarding.

The sections below reproduce the pull, the weekly trend, and the
per-step conversion table the recommendation is based on.\`;

const ACTIVATION_SQL = \`SELECT
  DATE_TRUNC('week', s.signup_at)          AS cohort_week,
  w.channel,
  COUNT(DISTINCT s.workspace_id)           AS signups,
  COUNT(DISTINCT a.workspace_id)           AS activated,
  ROUND(100.0 * COUNT(DISTINCT a.workspace_id)
    / COUNT(DISTINCT s.workspace_id), 1)   AS activation_pct
FROM signups s
JOIN workspaces w USING (workspace_id)
LEFT JOIN activation_events a
  ON a.workspace_id = s.workspace_id
 AND a.event_at < s.signup_at + INTERVAL '7 days'
WHERE s.signup_at >= DATE '2026-05-25'
GROUP BY 1, 2
ORDER BY 1, 2;\`;

// Captured result preview rendered beneath the query block.
const SQL_RESULT_ROWS = \`cohort_week  channel         signups  activated  activation_pct
2026-05-25   self_serve         1284        468            36.4
2026-05-25   sales_assisted      212        118            55.7
2026-06-01   self_serve         1341        512            38.2
2026-06-01   sales_assisted      198        112            56.6
2026-06-08   self_serve         1406        566            40.3
2026-06-08   sales_assisted      224        129            57.6\`;

const SQL_RESULT_CAPTION = 'Showing 6 of 10 rows · scanned 2.1 GB';

// Week-one activation percent per signup cohort week, by channel.
const activationTrend = [
  {week: 'W22', selfServe: 36.4, salesAssisted: 55.7},
  {week: 'W23', selfServe: 38.2, salesAssisted: 56.6},
  {week: 'W24', selfServe: 40.3, salesAssisted: 57.6},
  {week: 'W25', selfServe: 41.1, salesAssisted: 56.9},
  {week: 'W26', selfServe: 43.6, salesAssisted: 58.2},
];

// Step conversion table — percent of signups completing each onboarding
// step within 7 days, W26 cohort vs. the W22 baseline.
interface StepRow extends Record<string, unknown> {
  id: string;
  step: string;
  selfServe: string;
  salesAssisted: string;
  deltaLabel: string;
  deltaVariant: 'success' | 'error' | 'neutral';
}

const stepRows: StepRow[] = [
  {
    id: '1',
    step: 'Created first connection',
    selfServe: '78.4%',
    salesAssisted: '92.1%',
    deltaLabel: '+1.9 pts',
    deltaVariant: 'success',
  },
  {
    id: '2',
    step: 'Ran first report',
    selfServe: '64.2%',
    salesAssisted: '84.7%',
    deltaLabel: '+2.6 pts',
    deltaVariant: 'success',
  },
  {
    id: '3',
    step: 'Invited a teammate',
    selfServe: '38.9%',
    salesAssisted: '71.3%',
    deltaLabel: '+6.8 pts',
    deltaVariant: 'success',
  },
  {
    id: '4',
    step: 'Scheduled a report',
    selfServe: '29.5%',
    salesAssisted: '58.0%',
    deltaLabel: '-0.4 pts',
    deltaVariant: 'error',
  },
  {
    id: '5',
    step: 'Activated (3+ reports, 7d)',
    selfServe: '43.6%',
    salesAssisted: '58.2%',
    deltaLabel: '+3.2 pts',
    deltaVariant: 'success',
  },
];

const stepColumns: TableColumn<StepRow>[] = [
  {
    key: 'step',
    header: 'Onboarding step',
    width: proportional(2),
    renderCell: (item: StepRow) => <Text type="body">{item.step}</Text>,
  },
  {
    key: 'selfServe',
    header: 'Self-serve',
    width: pixel(110),
    renderCell: (item: StepRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.selfServe}</Text>
      </span>
    ),
  },
  {
    key: 'salesAssisted',
    header: 'Sales-assisted',
    width: pixel(130),
    renderCell: (item: StepRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.salesAssisted}</Text>
      </span>
    ),
  },
  {
    key: 'delta',
    header: 'vs. W22',
    width: pixel(110),
    renderCell: (item: StepRow) => (
      <Badge label={item.deltaLabel} variant={item.deltaVariant} />
    ),
  },
];

// Runnable block ids, in document order (Run all walks this list).
type RunnableBlockId = 'query' | 'chart' | 'table';
const RUNNABLE_BLOCKS: RunnableBlockId[] = ['query', 'chart', 'table'];

// Fixed per-block wall-clock durations shown in the provenance footer.
const BLOCK_DURATIONS: Record<RunnableBlockId, string> = {
  query: '0.8 s',
  chart: '0.3 s',
  table: '1.2 s',
};

// ============= NOTEBOOK BLOCK FRAME =============

/**
 * Subtle block frame with a floating hover toolbar. The toolbar is revealed
 * on hover or focus-within on hover-capable pointers; on touch devices
 * (\`isToolbarPinned\`) it renders in flow as a right-aligned row at the top
 * of the block with 40px tap targets, so it never occludes block content.
 * \`input\` renders above the optional \`output\` area; a run provenance footer
 * appears when \`footer\` text is provided.
 */
function NotebookBlock({
  title,
  primaryAction,
  menuItems,
  isToolbarPinned,
  input,
  output,
  isOutputHidden,
  footer,
}: {
  title: string;
  primaryAction: ReactNode;
  menuItems: DropdownMenuOption[];
  isToolbarPinned: boolean;
  input: ReactNode;
  output?: ReactNode;
  isOutputHidden?: boolean;
  footer?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const isToolbarVisible = isHovered || isFocusWithin;

  return (
    <section
      aria-label={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocusWithin(false);
        }
      }}
      style={{
        ...styles.block,
        ...(isHovered ? styles.blockHovered : undefined),
      }}>
      {isToolbarPinned ? (
        <div style={styles.blockToolbarRow}>
          {primaryAction}
          <MoreMenu
            label={\`\${title} options\`}
            size="sm"
            items={menuItems}
            style={styles.iconTapTarget}
          />
        </div>
      ) : (
        <div
          style={{
            ...styles.blockToolbar,
            ...(isToolbarVisible ? styles.blockToolbarVisible : undefined),
          }}>
          {primaryAction}
          <MoreMenu label={\`\${title} options\`} size="sm" items={menuItems} />
        </div>
      )}
      {input}
      {output !== undefined &&
        (isOutputHidden ? (
          <div style={styles.blockOutput}>
            <Text type="supporting" color="secondary">
              Output hidden — use the block menu to show it.
            </Text>
          </div>
        ) : (
          <div style={styles.blockOutput}>{output}</div>
        ))}
      {footer !== undefined && (
        <div style={styles.blockFooter}>
          <Text type="supporting" color="secondary">
            {footer}
          </Text>
        </div>
      )}
    </section>
  );
}

/** Title + caption row used as the input area of chart and table blocks. */
function BlockTitle({title, caption}: {title: string; caption: string}) {
  return (
    <div style={styles.blockBody}>
      <VStack gap={1}>
        <Heading level={3}>{title}</Heading>
        <Text type="supporting" color="secondary">
          {caption}
        </Text>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function NotebookReportTemplate() {
  // Deterministic run numbers, Jupyter-style: seeded per block, bumped by
  // each Run / Run all. No clocks — durations are fixed fixtures.
  const [runNumbers, setRunNumbers] = useState<Record<RunnableBlockId, number>>(
    {query: 2, chart: 3, table: 4},
  );
  const [nextRun, setNextRun] = useState(5);
  const [hiddenOutputs, setHiddenOutputs] = useState<
    Partial<Record<RunnableBlockId, boolean>>
  >({});
  const isNarrow = useMediaQuery('(max-width: 720px)');
  // Touch devices get always-visible block toolbars (no hover to reveal).
  const isToolbarPinned = useMediaQuery('(hover: none)');

  const runBlock = (id: RunnableBlockId) => {
    setRunNumbers(prev => ({...prev, [id]: nextRun}));
    setNextRun(prev => prev + 1);
  };

  const runAll = () => {
    setRunNumbers(prev => {
      const next = {...prev};
      RUNNABLE_BLOCKS.forEach((id, index) => {
        next[id] = nextRun + index;
      });
      return next;
    });
    setNextRun(prev => prev + RUNNABLE_BLOCKS.length);
  };

  const toggleOutput = (id: RunnableBlockId) => {
    setHiddenOutputs(prev => ({...prev, [id]: !prev[id]}));
  };

  const footerFor = (id: RunnableBlockId) =>
    \`Run \${runNumbers[id]} · \${BLOCK_DURATIONS[id]} · prod-warehouse\`;

  const runButton = (id: RunnableBlockId, label: string) => (
    <IconButton
      label={label}
      icon={<Icon icon={PlayIcon} size="sm" />}
      variant="ghost"
      size="sm"
      style={isToolbarPinned ? styles.iconTapTarget : undefined}
      onClick={() => runBlock(id)}
    />
  );

  const runnableMenu = (id: RunnableBlockId): DropdownMenuOption[] => [
    {label: 'Run block', onClick: () => runBlock(id)},
    {
      label: hiddenOutputs[id] ? 'Show output' : 'Hide output',
      onClick: () => toggleOutput(id),
    },
    {type: 'divider'},
    {label: 'Duplicate block', onClick: () => {}},
    {label: 'Copy link to block', onClick: () => {}},
    {label: 'Delete block', onClick: () => {}},
  ];

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <VStack gap={1}>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>{REPORT.title}</Heading>
                  <Badge label={REPORT.status} variant="success" />
                </HStack>
              </StackItem>
              {!isNarrow && (
                <Text type="supporting" color="secondary">
                  {REPORT.kernel}
                </Text>
              )}
              <Button
                label="Run all"
                icon={<Icon icon={PlayIcon} size="sm" />}
                onClick={runAll}
              />
              <MoreMenu
                label="Report options"
                items={[
                  {label: 'Export as PDF', onClick: () => {}},
                  {label: 'Schedule refresh', onClick: () => {}},
                  {label: 'Duplicate report', onClick: () => {}},
                  {type: 'divider'},
                  {label: 'Archive report', onClick: () => {}},
                ]}
              />
            </HStack>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Avatar name={REPORT.author} size="xsmall" />
              <Text type="supporting" color="secondary">
                {REPORT.author} · {REPORT.team}
              </Text>
              <Text type="supporting" color="secondary">
                ·
              </Text>
              <Text type="supporting" color="secondary">
                Published
              </Text>
              <Timestamp value={REPORT.publishedAt} format="date_time" />
            </HStack>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <div style={styles.document}>
            <VStack gap={4}>
              {/* Prose block — Markdown summary and method notes */}
              <NotebookBlock
                title="Summary"
                isToolbarPinned={isToolbarPinned}
                primaryAction={
                  <IconButton
                    label="Edit text"
                    icon={<Icon icon={SquarePenIcon} size="sm" />}
                    variant="ghost"
                    size="sm"
                    style={isToolbarPinned ? styles.iconTapTarget : undefined}
                  />
                }
                menuItems={[
                  {label: 'Edit text', onClick: () => {}},
                  {label: 'Duplicate block', onClick: () => {}},
                  {label: 'Copy link to block', onClick: () => {}},
                  {type: 'divider'},
                  {label: 'Delete block', onClick: () => {}},
                ]}
                input={
                  <div style={styles.blockBody}>
                    <Markdown>{SUMMARY_MARKDOWN}</Markdown>
                  </div>
                }
              />

              {/* Query block — SQL source with the captured result beneath */}
              <NotebookBlock
                title="Activation query"
                isToolbarPinned={isToolbarPinned}
                primaryAction={runButton('query', 'Run query')}
                menuItems={runnableMenu('query')}
                input={
                  <CodeBlock
                    code={ACTIVATION_SQL}
                    language="sql"
                    hasLineNumbers
                    hasCopyButton
                    width="100%"
                    container="section"
                  />
                }
                output={
                  <VStack gap={2}>
                    <pre style={styles.resultText}>{SQL_RESULT_ROWS}</pre>
                    <Text type="supporting" color="secondary">
                      {SQL_RESULT_CAPTION}
                    </Text>
                  </VStack>
                }
                isOutputHidden={hiddenOutputs.query}
                footer={footerFor('query')}
              />

              {/* Chart block — weekly activation trend by channel */}
              <NotebookBlock
                title="Activation trend"
                isToolbarPinned={isToolbarPinned}
                primaryAction={runButton('chart', 'Refresh chart')}
                menuItems={runnableMenu('chart')}
                input={
                  <BlockTitle
                    title="Week-one activation by cohort"
                    caption="Percent of signups activated within 7 days, by channel"
                  />
                }
                output={
                  <div style={styles.chartBody}>
                    <Chart
                      data={activationTrend}
                      xKey="week"
                      series={[
                        line('selfServe', {
                          color: chartColors.selfServe,
                          label: 'Self-serve',
                        }),
                        line('salesAssisted', {
                          color: chartColors.salesAssisted,
                          label: 'Sales-assisted',
                        }),
                      ]}
                      legend={{position: 'bottom', alignment: 'center'}}
                      tooltip={true}
                      grid={<ChartGrid horizontal />}
                      axes={
                        <>
                          <ChartAxis position="bottom" />
                          <ChartAxis
                            position="left"
                            tickFormat={(v: unknown) => \`\${v}%\`}
                          />
                        </>
                      }
                      height={260}
                      margin={{left: 40, right: 10, top: 10, bottom: 30}}
                    />
                  </div>
                }
                isOutputHidden={hiddenOutputs.chart}
                footer={footerFor('chart')}
              />

              {/* Table block — onboarding step conversion, W26 vs. W22 */}
              <NotebookBlock
                title="Step conversion"
                isToolbarPinned={isToolbarPinned}
                primaryAction={runButton('table', 'Refresh table')}
                menuItems={runnableMenu('table')}
                input={
                  <BlockTitle
                    title="Onboarding step conversion"
                    caption="W26 cohort, 7-day completion — delta vs. the W22 baseline"
                  />
                }
                output={
                  <Table<StepRow>
                    data={stepRows}
                    columns={stepColumns}
                    idKey="id"
                    density="compact"
                    dividers="rows"
                    hasHover
                  />
                }
                isOutputHidden={hiddenOutputs.table}
                footer={footerFor('table')}
              />
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};