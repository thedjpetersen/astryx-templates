var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (eight error issues with category,
 *   per-period event/user/session counts derived from fixed 7-day and
 *   24-hour bucket arrays, last-seen/first-seen labels, mono issue ids)
 * @output Sentry-style error-events monitor: header with period
 *   SegmentedControl (24h / 7d) and a sort Selector (Events / Recency);
 *   eight issue rows as Card + Collapsible with a category Badge, mono
 *   title, tabular \`events · users · sessions\` counts, last-seen label,
 *   and a 64×16 7-day trend polyline; expanding a row reveals a 24-hour
 *   sparkline with a hover crosshair + tooltip (\`14:00 · 12 events\`),
 *   first-seen date, mono issue id, and an \`Open in tracker\` ghost
 *   Button. One resolved row renders dimmed with a \`resolved\` Badge.
 * @position Page template; emitted by \`astryx template error-events-monitor\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * issue/event summary, sort Selector, period SegmentedControl).
 * LayoutContent hosts a centered 960px issue list; each row is a Card
 * whose Collapsible trigger is the summary line and whose body is the
 * 24h detail chart. Chart colors ride the icon tokens so light and dark
 * themes both work; single-series charts carry no legend (the caption
 * names the series) and the peak value is readable without hovering.
 *
 * Responsive contract:
 * - Issue list: maxWidth 960, centered; the list scrolls, header stays.
 * - >720px: trigger is a single line — Badge, mono title, counts,
 *   last-seen, and the 64×16 trend polyline right-aligned.
 * - <=720px (measured via a local ResizeObserver, NOT viewport media
 *   queries — the demo stage is narrower than the window): the trend
 *   polyline column drops and the counts + last-seen wrap to a second
 *   line under the title; the header summary caption is hidden.
 * - The 24h sparkline stretches to the row width at every size
 *   (preserveAspectRatio="none" + non-scaling strokes); the hover
 *   tooltip clamps to 8–92% so it never overflows the card.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {ExternalLinkIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  listColumn: {
    maxWidth: 960,
    marginInline: 'auto',
  },
  triggerTitleCell: {minWidth: 0},
  // Second trigger line on compact widths (counts + last seen).
  compactMetaRow: {paddingTop: 'var(--spacing-1)'},
  trendSvg: {display: 'block', flexShrink: 0},
  resolvedRow: {opacity: 0.55},
  detailBody: {paddingTop: 'var(--spacing-2)'},
  // Reserved headroom keeps the hover tooltip inside the card.
  chartWrap: {position: 'relative', paddingTop: 34},
  chartSvg: {display: 'block', width: '100%', height: 96, cursor: 'crosshair'},
  chartTooltip: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 2,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed bucket arrays, no clocks, no randomness.
// Event counts are DERIVED from the buckets (24h = sum of hourly24,
// 7d = sum of trend7d) so the charts and the numbers always agree.

type Period = '24h' | '7d';
type SortMode = 'events' | 'recency';

type Category =
  | 'Model API'
  | 'Stream Timeout'
  | 'Database'
  | 'Access Denied'
  | 'Context Overflow'
  | 'Unknown';

const CATEGORY_VARIANT: Record<
  Category,
  'info' | 'warning' | 'blue' | 'error' | 'neutral' | 'purple'
> = {
  'Model API': 'info',
  'Stream Timeout': 'warning',
  Database: 'blue',
  'Access Denied': 'error',
  'Context Overflow': 'neutral',
  Unknown: 'purple',
};

interface ErrorIssue {
  id: string; // mono issue id
  category: Category;
  title: string;
  lastSeenLabel: string;
  lastSeenMinutes: number; // recency sort key
  firstSeenLabel: string;
  usersByPeriod: Record<Period, number>;
  sessionsByPeriod: Record<Period, number>;
  trend7d: number[]; // daily events, oldest → newest
  hourly24: number[]; // 24 hourly buckets, 00:00 → 23:00
  isResolved: boolean;
}

const ISSUES: ErrorIssue[] = [
  {
    id: 'iss_9f3a2c1d',
    category: 'Model API',
    title: 'ModelGatewayError: upstream 429 from atlas-swe-2 (rate_limited)',
    lastSeenLabel: '4m ago',
    lastSeenMinutes: 4,
    firstSeenLabel: 'Jul 2',
    usersByPeriod: {'24h': 61, '7d': 240},
    sessionsByPeriod: {'24h': 84, '7d': 388},
    trend7d: [96, 120, 148, 210, 262, 241, 181],
    // Business-hours ramp with an afternoon peak.
    hourly24: [
      2, 1, 1, 0, 1, 2, 3, 5, 8, 12, 15, 18, 16, 14, 12, 15, 17, 13, 9, 6, 4,
      3, 2, 2,
    ],
    isResolved: false,
  },
  {
    id: 'iss_4b81e7f0',
    category: 'Stream Timeout',
    title: 'StreamTimeout: SSE stalled >30s in /v1/sessions/:id/stream',
    lastSeenLabel: '11m ago',
    lastSeenMinutes: 11,
    firstSeenLabel: 'Jun 28',
    usersByPeriod: {'24h': 18, '7d': 92},
    sessionsByPeriod: {'24h': 22, '7d': 131},
    trend7d: [40, 44, 38, 52, 61, 58, 49],
    hourly24: [
      1, 0, 1, 1, 0, 1, 2, 2, 3, 2, 3, 4, 3, 2, 3, 2, 4, 5, 4, 2, 2, 1, 1, 0,
    ],
    isResolved: false,
  },
  {
    id: 'iss_c2d90a44',
    category: 'Database',
    title: 'DeadlockDetected: insert on session_events blocked by vacuum',
    lastSeenLabel: '26m ago',
    lastSeenMinutes: 26,
    firstSeenLabel: 'Jul 9',
    usersByPeriod: {'24h': 6, '7d': 21},
    sessionsByPeriod: {'24h': 9, '7d': 38},
    trend7d: [2, 0, 14, 3, 1, 22, 9],
    // Bursty: quiet baseline with a 03:00 vacuum-window spike.
    hourly24: [
      0, 0, 1, 6, 4, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    ],
    isResolved: false,
  },
  {
    id: 'iss_7e15dd28',
    category: 'Access Denied',
    title: 'AccessDenied: sandbox egress to registry.npmjs.org blocked',
    lastSeenLabel: '38m ago',
    lastSeenMinutes: 38,
    firstSeenLabel: 'Jul 5',
    usersByPeriod: {'24h': 12, '7d': 47},
    sessionsByPeriod: {'24h': 20, '7d': 66},
    trend7d: [18, 16, 21, 25, 19, 23, 20],
    hourly24: [
      0, 0, 0, 0, 0, 1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1, 0, 1, 0, 0, 0,
    ],
    isResolved: false,
  },
  {
    id: 'iss_a06f31b9',
    category: 'Context Overflow',
    title: 'ContextOverflow: prompt exceeds 200k window after compaction',
    lastSeenLabel: '1h ago',
    lastSeenMinutes: 60,
    firstSeenLabel: 'Jun 30',
    usersByPeriod: {'24h': 9, '7d': 51},
    sessionsByPeriod: {'24h': 13, '7d': 58},
    trend7d: [4, 6, 9, 11, 15, 19, 24],
    hourly24: [
      0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 1, 2, 2, 1, 2, 3, 2, 2, 1, 1, 1, 1, 0, 0,
    ],
    isResolved: false,
  },
  {
    id: 'iss_1dc4587e',
    category: 'Model API',
    title: 'SchemaViolation: malformed tool_use block in model response',
    lastSeenLabel: '2h ago',
    lastSeenMinutes: 120,
    firstSeenLabel: 'Jun 24',
    usersByPeriod: {'24h': 15, '7d': 88},
    sessionsByPeriod: {'24h': 24, '7d': 107},
    trend7d: [30, 28, 35, 31, 27, 33, 29],
    hourly24: [
      1, 1, 0, 1, 1, 1, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 1, 1, 0, 0,
    ],
    isResolved: false,
  },
  {
    id: 'iss_e83b06c5',
    category: 'Unknown',
    title: 'UnhandledRejection: worker pool exited without stack (code 137)',
    lastSeenLabel: '5h ago',
    lastSeenMinutes: 300,
    firstSeenLabel: 'Jul 11',
    usersByPeriod: {'24h': 3, '7d': 11},
    sessionsByPeriod: {'24h': 3, '7d': 12},
    trend7d: [1, 3, 0, 2, 5, 1, 2],
    hourly24: [
      0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    isResolved: false,
  },
  {
    id: 'iss_50a9f2d7',
    category: 'Stream Timeout',
    title: 'StreamTimeout: heartbeat lost on relay websocket (eu-west)',
    lastSeenLabel: '2d ago',
    lastSeenMinutes: 2880,
    firstSeenLabel: 'Jun 26',
    usersByPeriod: {'24h': 0, '7d': 26},
    sessionsByPeriod: {'24h': 0, '7d': 31},
    trend7d: [58, 49, 31, 12, 4, 0, 0],
    hourly24: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    isResolved: true,
  },
];

const SORT_OPTIONS = [
  {value: 'events', label: 'Sort: Events'},
  {value: 'recency', label: 'Sort: Recency'},
];

const HOUR_LABELS = Array.from(
  {length: 24},
  (_, hour) => \`\${String(hour).padStart(2, '0')}:00\`,
);

function sumOf(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function eventsFor(issue: ErrorIssue, period: Period): number {
  return period === '24h' ? sumOf(issue.hourly24) : sumOf(issue.trend7d);
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

// ============= RESPONSIVE HELPER =============
// The demo stage is narrower than the window, so viewport media queries
// never fire there; measure the page's own width instead.

function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// ============= CHARTS =============

const TREND_W = 64;
const TREND_H = 16;
const TREND_PAD = 2;

/** 64×16 7-day trend: thin polyline + latest-day end dot. */
function TrendPolyline({issue}: {issue: ErrorIssue}) {
  const max = Math.max(...issue.trend7d, 1);
  const lastIndex = issue.trend7d.length - 1;
  const x = (i: number) =>
    TREND_PAD + (i * (TREND_W - 2 * TREND_PAD)) / lastIndex;
  const y = (v: number) =>
    TREND_H - TREND_PAD - (v / max) * (TREND_H - 2 * TREND_PAD);
  const points = issue.trend7d
    .map((value, index) => \`\${x(index).toFixed(1)},\${y(value).toFixed(1)}\`)
    .join(' ');
  const stroke = issue.isResolved
    ? 'var(--color-border-primary)'
    : 'var(--color-icon-blue)';
  const latest = issue.trend7d[lastIndex];
  return (
    <svg
      width={TREND_W}
      height={TREND_H}
      viewBox={\`0 0 \${TREND_W} \${TREND_H}\`}
      style={styles.trendSvg}
      role="img"
      aria-label={\`7-day trend: \${formatCount(sumOf(issue.trend7d))} events, \${formatCount(latest)} yesterday\`}>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={1.5} />
      <circle cx={x(lastIndex)} cy={y(latest)} r={2} fill={stroke} />
    </svg>
  );
}

const CHART_W = 480;
const CHART_H = 96;
const CHART_PAD_X = 6;
const CHART_PAD_TOP = 8;
const CHART_BASE_Y = CHART_H - 6;

/**
 * 24-hour detail sparkline. Fixed hourly buckets; the crosshair snaps to
 * the nearest bucket on mouse move and the tooltip reads
 * \`14:00 · 12 events\`. The peak is also in the caption below the chart,
 * so nothing is hover-only.
 */
function HourlySparkline({issue}: {issue: ErrorIssue}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(...issue.hourly24);
  const lastIndex = issue.hourly24.length - 1;
  const x = (i: number) =>
    CHART_PAD_X + (i * (CHART_W - 2 * CHART_PAD_X)) / lastIndex;
  const y = (v: number) =>
    max === 0
      ? CHART_BASE_Y
      : CHART_BASE_Y - (v / max) * (CHART_BASE_Y - CHART_PAD_TOP);
  const linePoints = issue.hourly24
    .map((value, index) => \`\${x(index).toFixed(1)},\${y(value).toFixed(1)}\`)
    .join(' ');
  const areaPoints = \`\${x(0).toFixed(1)},\${CHART_BASE_Y} \${linePoints} \${x(
    lastIndex,
  ).toFixed(1)},\${CHART_BASE_Y}\`;

  const peak = Math.max(...issue.hourly24);
  const peakIndex = issue.hourly24.indexOf(peak);
  const caption =
    peak === 0
      ? '24h volume · no events in the last 24 hours'
      : \`24h volume · peak \${formatCount(peak)} events at \${HOUR_LABELS[peakIndex]}\`;

  const handleMouseMove = (event: ReactMouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) {
      return;
    }
    const fraction = (event.clientX - rect.left) / rect.width;
    const index = Math.min(
      lastIndex,
      Math.max(0, Math.round(fraction * lastIndex)),
    );
    setHoverIndex(index);
  };

  const hoverValue = hoverIndex == null ? 0 : issue.hourly24[hoverIndex];
  const tooltipLeftPct =
    hoverIndex == null
      ? 0
      : Math.min(92, Math.max(8, (x(hoverIndex) / CHART_W) * 100));

  return (
    <VStack gap={1}>
      <div style={styles.chartWrap}>
        {hoverIndex != null && (
          <div style={{...styles.chartTooltip, left: \`\${tooltipLeftPct}%\`}}>
            <Text type="supporting" hasTabularNumbers>
              {HOUR_LABELS[hoverIndex]} · {formatCount(hoverValue)} events
            </Text>
          </div>
        )}
        <svg
          viewBox={\`0 0 \${CHART_W} \${CHART_H}\`}
          preserveAspectRatio="none"
          style={styles.chartSvg}
          role="img"
          aria-label={
            peak === 0
              ? \`Hourly event volume for \${issue.id}: no events in the last 24 hours\`
              : \`Hourly event volume for \${issue.id}: peak \${peak} events at \${HOUR_LABELS[peakIndex]}\`
          }
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}>
          <line
            x1={CHART_PAD_X}
            x2={CHART_W - CHART_PAD_X}
            y1={CHART_BASE_Y}
            y2={CHART_BASE_Y}
            stroke="var(--color-border)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <polygon
            points={areaPoints}
            fill="var(--color-icon-blue)"
            fillOpacity={0.08}
          />
          <polyline
            points={linePoints}
            fill="none"
            stroke="var(--color-icon-blue)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
          {hoverIndex != null && (
            <>
              <line
                x1={x(hoverIndex)}
                x2={x(hoverIndex)}
                y1={CHART_PAD_TOP}
                y2={CHART_BASE_Y}
                stroke="var(--color-border-primary)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={x(hoverIndex)}
                cy={y(hoverValue)}
                r={3}
                fill="var(--color-icon-blue)"
                stroke="var(--color-background-card)"
                strokeWidth={1.5}
              />
            </>
          )}
        </svg>
      </div>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {caption}
      </Text>
    </VStack>
  );
}

// ============= ISSUE ROW =============

function IssueRow({
  issue,
  period,
  isCompact,
}: {
  issue: ErrorIssue;
  period: Period;
  isCompact: boolean;
}) {
  const events = eventsFor(issue, period);
  const countsLine = \`\${formatCount(events)} events · \${formatCount(
    issue.usersByPeriod[period],
  )} users · \${formatCount(issue.sessionsByPeriod[period])} sessions\`;

  const countsText = (
    <Text type="supporting" color="secondary" hasTabularNumbers>
      {countsLine}
    </Text>
  );
  const lastSeenText = (
    <Text type="supporting" color="secondary">
      last seen {issue.lastSeenLabel}
    </Text>
  );

  const trigger = (
    <VStack gap={0}>
      <HStack gap={2} vAlign="center">
        <Badge
          label={issue.category}
          variant={CATEGORY_VARIANT[issue.category]}
        />
        <StackItem size="fill" style={styles.triggerTitleCell}>
          <Text type="code" size="sm" maxLines={1}>
            {issue.title}
          </Text>
        </StackItem>
        {issue.isResolved && <Badge label="resolved" variant="success" />}
        {!isCompact && (
          <>
            {countsText}
            {lastSeenText}
            <TrendPolyline issue={issue} />
          </>
        )}
      </HStack>
      {isCompact && (
        <HStack gap={2} vAlign="center" style={styles.compactMetaRow}>
          {countsText}
          <StackItem size="fill" />
          {lastSeenText}
        </HStack>
      )}
    </VStack>
  );

  return (
    <div style={issue.isResolved ? styles.resolvedRow : undefined}>
      <Card padding={3}>
        <Collapsible defaultIsOpen={false} trigger={trigger}>
          <VStack gap={3} style={styles.detailBody}>
            <HourlySparkline issue={issue} />
            <Divider />
            <HStack gap={3} vAlign="center">
              <Text type="supporting" color="secondary">
                first seen {issue.firstSeenLabel}
              </Text>
              <Text type="code" size="sm" color="secondary">
                {issue.id}
              </Text>
              <StackItem size="fill" />
              <Button
                label="Open in tracker"
                variant="ghost"
                size="sm"
                icon={
                  <Icon icon={ExternalLinkIcon} size="sm" color="inherit" />
                }
                onClick={() => {}}
              />
            </HStack>
          </VStack>
        </Collapsible>
      </Card>
    </div>
  );
}

// ============= PAGE =============

export default function ErrorEventsMonitorTemplate() {
  const [period, setPeriod] = useState<Period>('24h');
  const [sortMode, setSortMode] = useState<SortMode>('events');

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;

  const sortedIssues = useMemo(() => {
    const copy = [...ISSUES];
    if (sortMode === 'events') {
      copy.sort((a, b) => eventsFor(b, period) - eventsFor(a, period));
    } else {
      copy.sort((a, b) => a.lastSeenMinutes - b.lastSeenMinutes);
    }
    return copy;
  }, [period, sortMode]);

  const totalEvents = useMemo(
    () => sumOf(ISSUES.map(issue => eventsFor(issue, period))),
    [period],
  );

  return (
    <div ref={wrapRef} style={{height: '100%'}}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>Error events</Heading>
                  {!isCompact && (
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {ISSUES.length} issues · {formatCount(totalEvents)} events
                      in the {period === '24h' ? 'last 24 hours' : 'last 7 days'}
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <Selector
                label="Sort issues"
                isLabelHidden
                size="sm"
                options={SORT_OPTIONS}
                value={sortMode}
                onChange={value => setSortMode(value as SortMode)}
              />
              <SegmentedControl
                label="Time period"
                size="sm"
                value={period}
                onChange={value => setPeriod(value as Period)}>
                <SegmentedControlItem value="24h" label="24h" />
                <SegmentedControlItem value="7d" label="7d" />
              </SegmentedControl>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <div style={styles.listColumn}>
              <VStack gap={2}>
                {sortedIssues.map(issue => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    period={period}
                    isCompact={isCompact}
                  />
                ))}
              </VStack>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};