var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (312-user activation funnel with per-stage
 *   counts, an Engineers comparison segment with fixed deltas, weekly cohort
 *   conversion percentages, and drop-off callouts)
 * @output Product-activation analytics page built around a horizontal funnel:
 *   five summary stat Cards, a "Biggest Drop-offs" Card with severity
 *   StatusDots and suggestion lines, the interactive funnel Card — one row per
 *   milestone with a clickable stage label (strikethrough = excluded), a
 *   proportional colored bar with the user count inside, "of total" and
 *   "step CVR" columns, and green/red delta Badges against a comparison
 *   segment rendered as ghost bars — plus a cohort-conversion heatmap Table
 *   (weekly cohorts x 8 milestones with tinted cells) and a milestone-velocity
 *   bar strip with hover Tooltips
 * @position Page template; emitted by \`astryx template activation-funnel-analytics\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title, user
 * count, period Selector, segment Selector). LayoutContent scrolls a centered
 * max-w-6xl column of stacked sections: stat Grid, drop-offs Card, funnel
 * Card, cohort heatmap Table, velocity strip Card. Dashboards use Cards for
 * widgets, but the page chrome stays frame-first.
 *
 * Responsive contract:
 * - Page column: maxWidth 1152, centered; the whole content area scrolls.
 * - Header rows: the page header and the funnel Card header wrap
 *   (wrap="wrap"), so the Selectors drop below the title when the viewport
 *   is too narrow for one row.
 * - Stat Grid: columns={{minWidth: 190, max: 5}} — 5-up wide, reflowing to
 *   2-up below ~768px and 1-up on very narrow viewports.
 * - Funnel rows: fixed 140px label column + flexible bar track + 3 numeric
 *   columns. <=640px the label column narrows to 104px, the stage label
 *   becomes a two-line >=40px tap target carrying "users · of-total" (the
 *   in-bar count and the of-total + step-CVR columns drop), and only the
 *   comparison delta column stays; the Reset link also grows to a >=40px
 *   tap target.
 * - Cohort heatmap: sticky first column; below ~1024px the table scrolls
 *   horizontally inside its Card (fixed pixel milestone columns).
 * - Velocity strip: bars are flex children and compress evenly; labels
 *   truncate rather than wrap. On hover-capable pointers the details live
 *   in Tooltips; on touch devices ("(hover: none)") each bar is a button
 *   and tapping it prints the details line under the strip.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, pixel, useTableStickyColumns} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {RefreshCwIcon} from 'lucide-react';

// ============= STYLES =============

// Data colors via Astryx tokens with hex fallbacks (heatmap tints are
// intentionally translucent literals so they read on any card surface).
const colors = {
  bar: 'var(--color-data-categorical-blue, #0171E3)',
  indigo: 'var(--color-data-categorical-purple, #6B1EFD)',
  green: 'var(--color-data-categorical-green, #0B991F)',
  amber: 'var(--color-data-categorical-orange, #EB6E00)',
  red: 'var(--color-data-categorical-red, #D92D20)',
  tintGreen: 'rgba(11, 153, 31, 0.16)',
  tintAmber: 'rgba(235, 110, 0, 0.16)',
  tintRed: 'rgba(217, 45, 32, 0.14)',
};

const styles: Record<string, CSSProperties> = {
  // Centered scrollable page column (max-w-6xl).
  page: {maxWidth: 1152, marginInline: 'auto', width: '100%'},
  numeric: {fontVariantNumeric: 'tabular-nums'},
  // Funnel row track: relative wrapper so the ghost comparison bar can sit
  // behind the primary bar at 20% opacity.
  barTrack: {
    position: 'relative',
    height: 26,
    borderRadius: 'var(--radius-control, 6px)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    minWidth: 0,
  },
  ghostBar: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    backgroundColor: colors.bar,
    opacity: 0.2,
    borderRadius: 'var(--radius-control, 6px)',
  },
  primaryBar: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    backgroundColor: colors.bar,
    borderRadius: 'var(--radius-control, 6px)',
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: 8,
  },
  barCount: {
    color: '#fff',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  excludedLabel: {textDecorationLine: 'line-through'},
  // <=640px the stage label Link grows to a >=40px tap target and carries a
  // second "users · of-total" line (the in-bar count and the of-total column
  // hide at that width, so the label cell becomes the data's home).
  stageLinkCompact: {minHeight: 40, alignItems: 'center'},
  // Compact-mode grow for the "Reset (n hidden)" text Link's tap target.
  resetLinkCompact: {minHeight: 40, alignItems: 'center'},
  // Excluded rows keep the empty track (and fixed columns) so every row's
  // bar scale stays aligned; the note sits where the bar would start.
  excludedNote: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: 8,
  },
  // Fixed numeric columns keep digits aligned across funnel rows.
  colOfTotal: {width: 56, textAlign: 'end'},
  colCvr: {width: 64, textAlign: 'end'},
  colDelta: {width: 64, display: 'flex', justifyContent: 'flex-end'},
  // Heatmap: horizontal scroll wrapper; pixel columns keep cell tints stable.
  heatScroll: {overflowX: 'auto', minWidth: 0},
  heatCell: {
    borderRadius: 'var(--radius-control, 6px)',
    paddingBlock: 3,
    textAlign: 'center',
  },
  // Velocity strip: fixed-height flex row, bars grow from the baseline.
  velocityRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 'var(--spacing-2)',
    height: 120,
  },
  velocityCol: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  velocityBar: {
    width: '100%',
    borderRadius: 'var(--radius-control, 6px) var(--radius-control, 6px) 0 0',
  },
  velocityLabels: {display: 'flex', gap: 'var(--spacing-2)'},
  velocityLabel: {flex: 1, minWidth: 0, textAlign: 'center'},
  // Touch devices suppress hover Tooltips, so each velocity bar becomes an
  // unstyled full-height button; tapping prints the details under the strip.
  velocityTapButton: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    cursor: 'pointer',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed counts and cohort weeks, no clocks, no
// randomness. Percentages derive from counts at render time so excluding a
// stage recomputes step CVR honestly.

const TOTAL_USERS = 312;
const SEGMENT_TOTAL: Record<string, number> = {all: 312, engineers: 204};

const PERIOD_OPTIONS = [
  {value: 'all', label: 'All time'},
  {value: '7d', label: 'Last 7 days'},
  {value: '30d', label: 'Last 30 days'},
  {value: '90d', label: 'Last 90 days'},
];
const PERIOD_LABEL: Record<string, string> = {
  all: 'All time',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

const SEGMENT_OPTIONS = [
  {value: 'all', label: 'All users (312)'},
  {value: 'engineers', label: 'Engineers (204)'},
];

const COMPARE_OPTIONS = [
  {value: 'none', label: 'No comparison'},
  {value: 'engineers', label: 'vs Engineers (204)'},
];
const COMPARE_TOTAL = 204;

interface FunnelStage {
  id: string;
  label: string;
  shortLabel: string;
  users: number;
  /** Comparison-segment (Engineers) users at this stage. */
  compareUsers: number;
  /** Fixed of-total delta vs the comparison segment, in points. */
  compareDelta: number;
}

const STAGES: FunnelStage[] = [
  {
    id: 'onboarded',
    label: 'Onboarded',
    shortLabel: 'Onboard',
    users: 312,
    compareUsers: 204,
    compareDelta: 0,
  },
  {
    id: 'session',
    label: 'First session',
    shortLabel: 'Session',
    users: 289,
    compareUsers: 192,
    compareDelta: 1.5,
  },
  {
    id: 'second-turn',
    label: 'Second turn',
    shortLabel: '2nd turn',
    users: 241,
    compareUsers: 162,
    compareDelta: 1.9,
  },
  {
    id: 'node',
    label: 'Node connected',
    shortLabel: 'Node',
    users: 212,
    compareUsers: 151,
    compareDelta: 6.2,
  },
  {
    id: 'tool',
    label: 'First tool use',
    shortLabel: 'Tool',
    users: 151,
    compareUsers: 106,
    compareDelta: 3.6,
  },
  {
    id: 'edit',
    label: 'First edit',
    shortLabel: 'Edit',
    users: 128,
    compareUsers: 91,
    compareDelta: 3.5,
  },
  {
    id: 'diff',
    label: 'First diff',
    shortLabel: 'Diff',
    users: 97,
    compareUsers: 68,
    compareDelta: 2.1,
  },
  {
    id: 'day2',
    label: 'Day 2 return',
    shortLabel: 'Day 2',
    users: 66,
    compareUsers: 37,
    compareDelta: -3.1,
  },
  {
    id: 'power',
    label: 'Power user',
    shortLabel: 'Power',
    users: 37,
    compareUsers: 28,
    compareDelta: 1.8,
  },
];

// "Second turn" is a noisy milestone — analysts hid it, hence the
// "Reset (1 hidden)" affordance in the funnel header.
const INITIALLY_EXCLUDED = ['second-turn'];

// Summary stat row. Day 2 Return is measured among node-connected users,
// which is why it reads higher than the funnel's of-total 21%.
const SUMMARY_STATS: Array<{
  id: string;
  label: string;
  value: string;
  description: string;
  pct: number | null;
}> = [
  {
    id: 'total',
    label: 'Total Users',
    value: '312',
    description: 'All time · all segments',
    pct: null,
  },
  {
    id: 'any-node',
    label: 'Any Node',
    value: '68%',
    description: '212 of 312 users',
    pct: 68,
  },
  {
    id: 'cli-node',
    label: 'CLI Node',
    value: '41%',
    description: '128 of 312 users',
    pct: 41,
  },
  {
    id: 'day2',
    label: 'Day 2 Return',
    value: '54%',
    description: 'of node-connected users',
    pct: 54,
  },
  {
    id: 'power',
    label: 'Power Users',
    value: '12%',
    description: '37 of 312 users',
    pct: 12,
  },
];

const DROP_OFFS: Array<{
  id: string;
  severity: 'error' | 'warning';
  transition: string;
  loss: string;
  suggestion: string;
}> = [
  {
    id: 'node-tool',
    severity: 'error',
    transition: 'Node connected → First tool use',
    loss: '61 users lost (29% drop)',
    suggestion: 'Surface tool examples right after node setup.',
  },
  {
    id: 'diff-day2',
    severity: 'warning',
    transition: 'First diff → Day 2 return',
    loss: '31 users lost (32% drop)',
    suggestion: 'Send a day-1 recap of the diff they shipped to pull them back.',
  },
];

// Cohort heatmap: weekly cohorts x 8 milestones, percentages of cohort n.
// 0 renders as an em-dash (cohort too old/small to have produced the event).
interface CohortRow extends Record<string, unknown> {
  id: string;
  week: string;
  n: number;
  onboarded: number;
  session: number;
  node: number;
  tool: number;
  edit: number;
  diff: number;
  day2: number;
  power: number;
}

const COHORTS: CohortRow[] = [
  {
    id: 'c-0518',
    week: '2026-05-18',
    n: 38,
    onboarded: 100,
    session: 92,
    node: 66,
    tool: 47,
    edit: 39,
    diff: 32,
    day2: 24,
    power: 0,
  },
  {
    id: 'c-0525',
    week: '2026-05-25',
    n: 44,
    onboarded: 100,
    session: 91,
    node: 64,
    tool: 45,
    edit: 41,
    diff: 34,
    day2: 25,
    power: 9,
  },
  {
    id: 'c-0601',
    week: '2026-06-01',
    n: 52,
    onboarded: 100,
    session: 94,
    node: 69,
    tool: 50,
    edit: 44,
    diff: 33,
    day2: 23,
    power: 12,
  },
  {
    id: 'c-0608',
    week: '2026-06-08',
    n: 61,
    onboarded: 100,
    session: 93,
    node: 70,
    tool: 52,
    edit: 43,
    diff: 31,
    day2: 21,
    power: 10,
  },
  {
    id: 'c-0615',
    week: '2026-06-15',
    n: 41,
    onboarded: 100,
    session: 95,
    node: 71,
    tool: 49,
    edit: 41,
    diff: 29,
    day2: 22,
    power: 7,
  },
];

const MILESTONE_COLUMNS: Array<{key: keyof CohortRow & string; header: string}> =
  [
    {key: 'onboarded', header: 'Onboard'},
    {key: 'session', header: 'Session'},
    {key: 'node', header: 'Node'},
    {key: 'tool', header: 'Tool'},
    {key: 'edit', header: 'Edit'},
    {key: 'diff', header: 'Diff'},
    {key: 'day2', header: 'Day 2'},
    {key: 'power', header: 'Power'},
  ];

// ============= DERIVED FUNNEL MATH =============

interface FunnelRow extends FunnelStage {
  isExcluded: boolean;
  /** Percent of total users, rounded. */
  ofTotal: number;
  /** Conversion vs the previous *included* stage; null for the first stage. */
  stepCvr: number | null;
  /** Comparison-segment percent of its own total (ghost bar width). */
  comparePct: number;
}

function buildFunnelRows(excluded: ReadonlySet<string>): FunnelRow[] {
  let previousIncludedUsers: number | null = null;
  return STAGES.map(stage => {
    const isExcluded = excluded.has(stage.id);
    const ofTotal = Math.round((stage.users / TOTAL_USERS) * 100);
    let stepCvr: number | null = null;
    if (!isExcluded) {
      stepCvr =
        previousIncludedUsers == null
          ? null
          : Math.round((stage.users / previousIncludedUsers) * 100);
      previousIncludedUsers = stage.users;
    }
    return {
      ...stage,
      isExcluded,
      ofTotal,
      stepCvr,
      comparePct: Math.round((stage.compareUsers / COMPARE_TOTAL) * 100),
    };
  });
}

function formatDelta(delta: number): string {
  const magnitude = Math.abs(delta).toFixed(1);
  return delta > 0 ? \`+\${magnitude}\` : delta < 0 ? \`-\${magnitude}\` : '0.0';
}

function cvrColor(cvr: number | null): string {
  if (cvr == null) {
    return colors.indigo;
  }
  return cvr >= 70 ? colors.green : cvr >= 40 ? colors.amber : colors.red;
}

function heatTint(value: number): CSSProperties | undefined {
  if (value === 0) {
    return undefined;
  }
  if (value >= 50) {
    return {backgroundColor: colors.tintGreen};
  }
  if (value >= 20) {
    return {backgroundColor: colors.tintAmber};
  }
  return {backgroundColor: colors.tintRed};
}

// ============= WIDGETS =============

function StatCard({stat}: {stat: (typeof SUMMARY_STATS)[number]}) {
  return (
    <Card>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {stat.label}
        </Text>
        <Heading level={2}>{stat.value}</Heading>
        <Text type="supporting" color="secondary" style={styles.numeric}>
          {stat.description}
        </Text>
        {stat.pct != null && (
          <ProgressBar
            value={stat.pct}
            max={100}
            label={\`\${stat.label} share of users\`}
            isLabelHidden
          />
        )}
      </VStack>
    </Card>
  );
}

function DropOffsCard() {
  return (
    <Card>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Heading level={3}>Biggest Drop-offs</Heading>
          <Text type="supporting" color="secondary">
            Largest step losses this period
          </Text>
        </HStack>
        <VStack gap={0}>
          {DROP_OFFS.map((drop, index) => (
            <VStack key={drop.id} gap={0}>
              <HStack gap={2} vAlign="start" style={{paddingBlock: 8}}>
                <StatusDot
                  variant={drop.severity}
                  label={drop.severity === 'error' ? 'Severe' : 'Moderate'}
                />
                <VStack gap={0.5}>
                  <HStack gap={2} vAlign="center">
                    <Text type="label">{drop.transition}</Text>
                    <Text
                      type="supporting"
                      color="secondary"
                      style={styles.numeric}>
                      {drop.loss}
                    </Text>
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {drop.suggestion}
                  </Text>
                </VStack>
              </HStack>
              {index < DROP_OFFS.length - 1 && <Divider />}
            </VStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

function FunnelStageRow({
  row,
  showComparison,
  isCompact,
  onToggle,
}: {
  row: FunnelRow;
  showComparison: boolean;
  isCompact: boolean;
  onToggle: (id: string) => void;
}) {
  const labelWidth = isCompact ? 104 : 140;
  const deltaVariant =
    row.compareDelta > 0 ? 'green' : row.compareDelta < 0 ? 'red' : 'neutral';

  return (
    <HStack gap={3} vAlign="center">
      <div style={{width: labelWidth, flexShrink: 0}}>
        <Link
          onClick={() => onToggle(row.id)}
          style={isCompact ? styles.stageLinkCompact : undefined}>
          {isCompact ? (
            <VStack gap={0}>
              <Text
                type="supporting"
                color={row.isExcluded ? 'secondary' : undefined}
                style={row.isExcluded ? styles.excludedLabel : undefined}
                maxLines={1}>
                {row.label}
              </Text>
              {/* Compact: the in-bar count and of-total column hide, so the
                  label cell carries "users · of-total" (and grows the tap
                  target to two lines). */}
              <Text
                type="supporting"
                color="secondary"
                size="sm"
                style={styles.numeric}
                maxLines={1}>
                {row.isExcluded ? '—' : \`\${row.users} · \${row.ofTotal}%\`}
              </Text>
            </VStack>
          ) : (
            <Text
              type="supporting"
              color={row.isExcluded ? 'secondary' : undefined}
              style={row.isExcluded ? styles.excludedLabel : undefined}
              maxLines={1}>
              {row.label}
            </Text>
          )}
        </Link>
      </div>
      <StackItem size="fill" style={styles.barTrack}>
        {row.isExcluded ? (
          <div style={styles.excludedNote}>
            <Text type="supporting" color="secondary">
              excluded
            </Text>
          </div>
        ) : (
          <>
            {showComparison && (
              <div
                style={{...styles.ghostBar, width: \`\${row.comparePct}%\`}}
                aria-hidden
              />
            )}
            <div style={{...styles.primaryBar, width: \`\${row.ofTotal}%\`}}>
              {/* Compact tracks are too narrow to hold the count without
                  clipping; the label cell shows it instead. */}
              {!isCompact && <span style={styles.barCount}>{row.users}</span>}
            </div>
          </>
        )}
      </StackItem>
      {!isCompact && (
        <div style={styles.colOfTotal}>
          <Text type="supporting" color="secondary" style={styles.numeric}>
            {row.isExcluded ? '—' : \`\${row.ofTotal}%\`}
          </Text>
        </div>
      )}
      {!isCompact && (
        <div style={styles.colCvr}>
          <Text type="supporting" color="secondary" style={styles.numeric}>
            {row.isExcluded || row.stepCvr == null ? '—' : \`\${row.stepCvr}%\`}
          </Text>
        </div>
      )}
      {showComparison && (
        <div style={styles.colDelta}>
          {!row.isExcluded && (
            <Badge
              label={formatDelta(row.compareDelta)}
              variant={deltaVariant}
            />
          )}
        </div>
      )}
    </HStack>
  );
}

function velocityDetail(row: FunnelRow, index: number): string {
  return index === 0
    ? \`\${row.users} users · \${row.ofTotal}% of total — Baseline\`
    : \`\${row.users} users · \${row.ofTotal}% of total — Step CVR: \${row.stepCvr}%\`;
}

function VelocityStrip({rows, isTouch}: {rows: FunnelRow[]; isTouch: boolean}) {
  const visible = rows.filter(row => !row.isExcluded);
  // Touch devices never see hover Tooltips, so tapping a bar toggles a
  // details line under the strip instead.
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailIndex = visible.findIndex(row => row.id === detailId);
  const detailRow = detailIndex >= 0 ? visible[detailIndex] : null;
  return (
    <VStack gap={2}>
      <div style={styles.velocityRow}>
        {visible.map((row, index) => {
          const bar = (
            <div
              style={{
                ...styles.velocityBar,
                height: \`\${Math.max(row.ofTotal, 4)}%\`,
                backgroundColor:
                  index === 0 ? colors.indigo : cvrColor(row.stepCvr),
              }}
            />
          );
          return (
            <div key={row.id} style={styles.velocityCol}>
              {isTouch ? (
                <button
                  type="button"
                  style={styles.velocityTapButton}
                  aria-label={\`\${row.label}: \${velocityDetail(row, index)}\`}
                  aria-pressed={row.id === detailId}
                  onClick={() =>
                    setDetailId(prev => (prev === row.id ? null : row.id))
                  }>
                  {bar}
                </button>
              ) : (
                <Tooltip content={velocityDetail(row, index)}>{bar}</Tooltip>
              )}
            </div>
          );
        })}
      </div>
      <div style={styles.velocityLabels}>
        {visible.map(row => (
          <div key={row.id} style={styles.velocityLabel}>
            <Text type="supporting" color="secondary" size="sm" maxLines={1}>
              {row.shortLabel}
            </Text>
          </div>
        ))}
      </div>
      {isTouch && detailRow != null && (
        <Text type="supporting" color="secondary" style={styles.numeric}>
          {detailRow.label}: {velocityDetail(detailRow, detailIndex)}
        </Text>
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function ActivationFunnelAnalyticsTemplate() {
  const [period, setPeriod] = useState('all');
  const [segment, setSegment] = useState('all');
  const [compareWith, setCompareWith] = useState('engineers');
  const [excluded, setExcluded] = useState<ReadonlySet<string>>(
    new Set(INITIALLY_EXCLUDED),
  );

  // Responsive contract: <=640px narrows the stage-label column, moves the
  // user count + of-total share into it, and keeps only the delta column.
  const isCompact = useMediaQuery('(max-width: 640px)');
  // Touch devices get tap-to-reveal velocity details (Tooltips are
  // hover-only and suppressed on "(hover: none)" pointers).
  const isTouch = useMediaQuery('(hover: none)');

  const funnelRows = useMemo(() => buildFunnelRows(excluded), [excluded]);
  const showComparison = compareWith !== 'none';
  const hiddenCount = excluded.size;
  const allHidden = hiddenCount === STAGES.length;

  const toggleStage = (id: string) => {
    setExcluded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resetStages = () => setExcluded(new Set());

  // Cohort heatmap columns: sticky cohort column + 8 fixed milestone columns.
  const cohortColumns = useMemo<TableColumn<CohortRow>[]>(
    () => [
      {
        key: 'cohort',
        header: 'Cohort',
        width: pixel(132),
        renderCell: (item: CohortRow) => (
          <HStack gap={2} vAlign="center">
            <Text type="supporting" style={styles.numeric}>
              {item.week}
            </Text>
            <Text type="supporting" color="secondary" style={styles.numeric}>
              n={item.n}
            </Text>
          </HStack>
        ),
      },
      ...MILESTONE_COLUMNS.map(milestone => ({
        key: milestone.key,
        header: milestone.header,
        width: pixel(84),
        align: 'center' as const,
        renderCell: (item: CohortRow) => {
          const value = item[milestone.key] as number;
          return (
            <div style={{...styles.heatCell, ...heatTint(value)}}>
              <Text type="supporting" style={styles.numeric}>
                {value === 0 ? '—' : \`\${value}%\`}
              </Text>
            </div>
          );
        },
      })),
    ],
    [],
  );

  const stickyCohortColumn = useTableStickyColumns<CohortRow>({
    startKeys: ['cohort'],
  });

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Activation Funnel</Heading>
                <Text
                  type="supporting"
                  color="secondary"
                  style={styles.numeric}>
                  {SEGMENT_TOTAL[segment]} users · {PERIOD_LABEL[period]}
                </Text>
              </HStack>
            </StackItem>
            <Selector
              label="Period"
              isLabelHidden
              size="sm"
              options={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
            />
            <Selector
              label="Segment"
              isLabelHidden
              size="sm"
              options={SEGMENT_OPTIONS}
              value={segment}
              onChange={setSegment}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <div style={styles.page}>
            <VStack gap={6}>
              {/* Summary stat row — 5-up, reflowing to 2-up below ~768px. */}
              <Grid columns={{minWidth: 190, max: 5}} gap={4}>
                {SUMMARY_STATS.map(stat => (
                  <StatCard key={stat.id} stat={stat} />
                ))}
              </Grid>

              <DropOffsCard />

              {/* Interactive funnel: click a stage label to exclude it from
                  step-CVR math; ghost bars show the comparison segment. */}
              <Card>
                <VStack gap={4}>
                  <HStack gap={3} vAlign="center" wrap="wrap">
                    <StackItem size="fill">
                      <HStack gap={2} vAlign="center">
                        <Heading level={3}>Funnel</Heading>
                        <Text type="supporting" color="secondary">
                          Click a stage to exclude it
                        </Text>
                      </HStack>
                    </StackItem>
                    {hiddenCount > 0 && (
                      <Link
                        onClick={resetStages}
                        style={isCompact ? styles.resetLinkCompact : undefined}>
                        <Text type="supporting">
                          Reset ({hiddenCount} hidden)
                        </Text>
                      </Link>
                    )}
                    <Selector
                      label="Compare against segment"
                      isLabelHidden
                      size="sm"
                      options={COMPARE_OPTIONS}
                      value={compareWith}
                      onChange={setCompareWith}
                    />
                  </HStack>

                  {allHidden ? (
                    <EmptyState
                      title="All stages hidden"
                      description="Every milestone is excluded from the funnel. Reset to bring them back."
                      icon={<Icon icon={RefreshCwIcon} size="lg" />}
                      actions={
                        <Button
                          label="Reset stages"
                          size="sm"
                          onClick={resetStages}
                        />
                      }
                      isCompact
                    />
                  ) : (
                    <VStack gap={2}>
                      {/* Column captions align with the fixed numeric cells. */}
                      <HStack gap={3} vAlign="center">
                        <div style={{width: isCompact ? 104 : 140, flexShrink: 0}} />
                        <StackItem size="fill" />
                        {!isCompact && (
                          <div style={styles.colOfTotal}>
                            <Text type="supporting" color="secondary" size="sm">
                              of total
                            </Text>
                          </div>
                        )}
                        {!isCompact && (
                          <div style={styles.colCvr}>
                            <Text type="supporting" color="secondary" size="sm">
                              step CVR
                            </Text>
                          </div>
                        )}
                        {showComparison && (
                          <div style={styles.colDelta}>
                            <Text type="supporting" color="secondary" size="sm">
                              vs seg
                            </Text>
                          </div>
                        )}
                      </HStack>
                      {funnelRows.map(row => (
                        <FunnelStageRow
                          key={row.id}
                          row={row}
                          showComparison={showComparison}
                          isCompact={isCompact}
                          onToggle={toggleStage}
                        />
                      ))}
                      {showComparison && (
                        <Text type="supporting" color="secondary">
                          Ghost bars show Engineers (204) at 20% opacity;
                          deltas are of-total percentage points vs that
                          segment.
                        </Text>
                      )}
                    </VStack>
                  )}
                </VStack>
              </Card>

              {/* Cohort conversion heatmap — sticky cohort column, tinted
                  cells (green >=50%, amber >=20%, red below, em-dash = 0). */}
              <Card>
                <VStack gap={4}>
                  <HStack gap={2} vAlign="center">
                    <Heading level={3}>Cohort conversion</Heading>
                    <Text type="supporting" color="secondary">
                      Weekly cohorts · % of cohort reaching each milestone
                    </Text>
                  </HStack>
                  <div style={styles.heatScroll}>
                    <Table<CohortRow>
                      data={COHORTS}
                      columns={cohortColumns}
                      idKey="id"
                      density="compact"
                      dividers="rows"
                      hasHover
                      plugins={{stickyColumns: stickyCohortColumn}}
                    />
                  </div>
                </VStack>
              </Card>

              {/* Milestone velocity strip — bar heights track of-total share;
                  color reflects step-CVR health (green >=70, amber >=40). */}
              <Card>
                <VStack gap={4}>
                  <HStack gap={2} vAlign="center">
                    <Heading level={3}>Milestone velocity</Heading>
                    <Text type="supporting" color="secondary">
                      {isTouch
                        ? 'Tap a bar for users, of-total share, and step CVR'
                        : 'Hover a bar for users, of-total share, and step CVR'}
                    </Text>
                  </HStack>
                  <VelocityStrip rows={funnelRows} isTouch={isTouch} />
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