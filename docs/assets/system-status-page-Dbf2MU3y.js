var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (status scenarios, 24h headline stats,
 *   top-error rows, error-type and release breakdowns, 90-day per-service
 *   uptime day arrays, TTFT percentile tables per period, 14-day usage
 *   series with fixed values)
 * @output Public status/observability page for an AI agent platform: a
 *   tinted status band (StatusDot + headline retinted by a page-chrome
 *   scenario Selector), a left-border-divided HeaderStat strip with big
 *   tabular numbers, and a TabList (Errors / Health / Performance / Usage).
 *   Errors: Top Errors Table, By Error Type list with proportional thin
 *   bars, By Release rows with mono 7-char shas. Health: 90-day uptime
 *   segment bars (green/amber/red) for four services. Performance: TTFT
 *   p50/p90/p99 mini-table with a 1h/24h/7d period SegmentedControl.
 *   Usage: four stat cards plus a 14-day inline SVG bar chart with a
 *   per-bar hover readout
 * @position Page template; emitted by \`astryx template system-status-page\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the public chrome
 * (brand mark, status domain, scenario Selector, Subscribe button).
 * LayoutContent hosts a centered 960px column: status band, stat strip,
 * TabList, and the active tab's cards. Unlike error-events-monitor this
 * surface is the *public* rollup — aggregates and uptime, not triage.
 *
 * Responsive contract (useElementWidth on the page wrapper — viewport
 * media queries never fire in the inline demo stage):
 * - Column: maxWidth 960, centered; the page scrolls as one document.
 * - >720px: status band lays heading and "Updated" caption on one row;
 *   Top Errors keeps its Users column; header shows the status domain.
 * - <=720px: the band stacks vertically, the Users column drops, the
 *   header domain caption hides, and the usage chart labels every third
 *   day instead of every other. Stat strips and card grids reflow on
 *   their own via Grid minWidth tracks.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
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
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {ActivityIcon, RssIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  column: {
    maxWidth: 960,
    marginInline: 'auto',
    paddingBottom: 'var(--spacing-8)',
  },
  // Status band: the tint (background) is applied per scenario at render.
  band: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-5)',
    paddingBlock: 'var(--spacing-4)',
  },
  bandOperational: {backgroundColor: 'var(--color-success-muted)'},
  bandDegraded: {backgroundColor: 'var(--color-warning-muted)'},
  bandOutage: {backgroundColor: 'var(--color-error-muted)'},
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  // Stat strip: quote-bar left borders divide the blocks.
  statBlock: {
    borderLeft: '2px solid var(--color-border)',
    paddingLeft: 'var(--spacing-3)',
  },
  statValue: {
    fontSize: 28,
    lineHeight: 1.15,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  monoCell: {
    fontFamily: 'var(--font-family-code)',
    fontSize: 12,
    color: 'var(--color-text-primary)',
  },
  numCell: {textAlign: 'right'},
  // By-error-type proportional bars: single accent hue (one measure),
  // labels stay in text tokens — the mark carries the magnitude.
  typeTrack: {
    height: 6,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  typeFill: {
    height: '100%',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-accent)',
  },
  breakdownRow: {paddingBlock: 'var(--spacing-2)'},
  // 90-day uptime bars: one thin segment per day, 2px surface gaps.
  uptimeBar: {display: 'flex', gap: 2, width: '100%'},
  uptimeSegment: {flex: 1, height: 22, borderRadius: 2, minWidth: 0},
  legendSwatch: {width: 10, height: 10, borderRadius: 2},
  serviceRow: {paddingBlock: 'var(--spacing-2)'},
  chartSvg: {width: '100%', height: 'auto', display: 'block'},
};

const DAY_STATUS_COLOR: Record<DayStatus, string> = {
  ok: 'var(--color-success)',
  degraded: 'var(--color-warning)',
  down: 'var(--color-error)',
};

// Local ResizeObserver width hook — the demo stage is ~1045-1075px inside
// a 1440px window, so viewport media queries never fire there.
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

// ============= DATA =============
// Deterministic fixtures: fixed ISO-derived dates, no clocks, no randomness.

const BRAND_NAME = 'Lumen Status';
const STATUS_DOMAIN = 'status.lumen.dev';

type Scenario = 'operational' | 'degraded' | 'outage';

const SCENARIO_OPTIONS = [
  {value: 'operational', label: 'All operational'},
  {value: 'degraded', label: 'Partial degradation'},
  {value: 'outage', label: 'Major outage'},
];

const SCENARIOS: Record<
  Scenario,
  {
    heading: string;
    dot: 'success' | 'warning' | 'error';
    dotLabel: string;
    bandStyle: CSSProperties;
    note: string | null;
  }
> = {
  operational: {
    heading: 'All systems operational',
    dot: 'success',
    dotLabel: 'Operational',
    bandStyle: styles.bandOperational,
    note: null,
  },
  degraded: {
    heading: 'Some systems experiencing issues',
    dot: 'warning',
    dotLabel: 'Degraded',
    bandStyle: styles.bandDegraded,
    note: 'Realtime message delivery is degraded — investigating since 13:05 UTC.',
  },
  outage: {
    heading: 'Major systems outage',
    dot: 'error',
    dotLabel: 'Outage',
    bandStyle: styles.bandOutage,
    note: 'API and Realtime are down — incident opened 13:41 UTC, next update in 15 min.',
  },
};

const HEADER_STATS: ReadonlyArray<{
  id: string;
  label: string;
  value: string;
  detail: string;
}> = [
  {id: 'sessions', label: 'Sessions (24h)', value: '4,812', detail: '+8.2% vs prior day'},
  {id: 'users', label: 'Users', value: '1,209', detail: '312 first-time'},
  {id: 'errors', label: 'Error sessions', value: '38', detail: '0.8% of sessions'},
  {id: 'runs', label: 'Agent runs', value: '12,430', detail: '2.6 runs / session'},
];

type TabId = 'errors' | 'health' | 'performance' | 'usage';

// --- Errors tab ---

const TOP_ERRORS: ReadonlyArray<{
  id: string;
  title: string;
  count: number;
  users: number;
}> = [
  {id: 'e-1', title: 'StreamTimeout: model stream idle for 60s', count: 214, users: 102},
  {id: 'e-2', title: 'ToolExecutionError: sandbox exec timed out after 120s', count: 168, users: 74},
  {id: 'e-3', title: 'RateLimited: model gateway returned 429', count: 121, users: 63},
  {id: 'e-4', title: 'ContextOverflow: prompt exceeds 200k tokens', count: 84, users: 41},
  {id: 'e-5', title: 'SandboxProvisionError: pool exhausted (us-east)', count: 47, users: 29},
  {id: 'e-6', title: 'PermissionDenied: repo scope missing for connector', count: 23, users: 17},
  {id: 'e-7', title: 'WebSocketClosed: 1006 abnormal closure', count: 19, users: 12},
  {id: 'e-8', title: 'UnknownError: unhandled rejection in run worker', count: 12, users: 9},
];

const ERROR_TYPES: ReadonlyArray<{id: string; label: string; count: number}> = [
  {id: 't-1', label: 'Stream timeout', count: 412},
  {id: 't-2', label: 'Tool execution', count: 268},
  {id: 't-3', label: 'Rate limited', count: 191},
  {id: 't-4', label: 'Context overflow', count: 84},
  {id: 't-5', label: 'Sandbox provisioning', count: 47},
  {id: 't-6', label: 'Auth / permission', count: 23},
  {id: 't-7', label: 'Unknown', count: 12},
];

const ERROR_TYPE_MAX = 412;

const BY_RELEASE: ReadonlyArray<{
  id: string;
  sha: string;
  branch: string;
  pct: number;
}> = [
  {id: 'r-1', sha: 'f3a9c17', branch: 'main', pct: 46},
  {id: 'r-2', sha: '8b24de0', branch: 'main', pct: 27},
  {id: 'r-3', sha: 'c91f4a2', branch: 'release/0.9', pct: 15},
  {id: 'r-4', sha: '27d80b3', branch: 'canary', pct: 8},
  {id: 'r-5', sha: '5e10fb9', branch: 'older releases', pct: 4},
];

// --- Health tab ---

type DayStatus = 'ok' | 'degraded' | 'down';

const DAY_MS = 86400000;
// 90 days ending 2026-07-12 (the page's "today").
const HEALTH_START_UTC = Date.UTC(2026, 3, 14);
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function healthDayLabel(index: number): string {
  const date = new Date(HEALTH_START_UTC + index * DAY_MS);
  return \`\${MONTH_NAMES[date.getUTCMonth()]} \${date.getUTCDate()}\`;
}

const DAY_STATUS_LABEL: Record<DayStatus, string> = {
  ok: 'Operational',
  degraded: 'Degraded',
  down: 'Outage',
};

interface Service {
  id: string;
  name: string;
  uptime: string;
  incidents: string;
  // Sparse map of day index (0 = 90 days ago) -> worst status that day.
  days: Readonly<Record<number, DayStatus>>;
}

const SERVICES: readonly Service[] = [
  {
    id: 'api',
    name: 'API',
    uptime: '99.96%',
    incidents: '2 incidents · 41m downtime',
    days: {23: 'degraded', 57: 'down'},
  },
  {
    id: 'realtime',
    name: 'Realtime',
    uptime: '99.87%',
    incidents: '3 incidents · 1h 52m downtime',
    days: {12: 'degraded', 44: 'down', 45: 'degraded', 71: 'degraded'},
  },
  {
    id: 'sandbox',
    name: 'Sandbox pool',
    uptime: '99.42%',
    incidents: '2 incidents · 4h 10m downtime',
    days: {
      30: 'degraded',
      31: 'degraded',
      32: 'degraded',
      61: 'down',
      62: 'down',
      63: 'degraded',
    },
  },
  {
    id: 'gateway',
    name: 'Model gateway',
    uptime: '99.98%',
    incidents: '1 incident · 22m degraded',
    days: {80: 'degraded'},
  },
];

// The preview scenario bleeds into today's segment so the Health tab
// agrees with the band: degraded touches Realtime, outage takes down
// API + Realtime.
function todayOverride(serviceId: string, scenario: Scenario): DayStatus | null {
  if (scenario === 'degraded' && serviceId === 'realtime') {
    return 'degraded';
  }
  if (scenario === 'outage' && (serviceId === 'api' || serviceId === 'realtime')) {
    return 'down';
  }
  return null;
}

// --- Performance tab ---

type Period = '1h' | '24h' | '7d';

const TTFT_ROWS: Record<
  Period,
  ReadonlyArray<{model: string; p50: string; p90: string; p99: string}>
> = {
  '1h': [
    {model: 'lumen-ultra-2', p50: '0.58s', p90: '1.34s', p99: '3.2s'},
    {model: 'lumen-core-2', p50: '0.39s', p90: '0.92s', p99: '2.0s'},
    {model: 'lumen-mini-1', p50: '0.26s', p90: '0.58s', p99: '1.2s'},
  ],
  '24h': [
    {model: 'lumen-ultra-2', p50: '0.62s', p90: '1.48s', p99: '3.9s'},
    {model: 'lumen-core-2', p50: '0.41s', p90: '0.98s', p99: '2.2s'},
    {model: 'lumen-mini-1', p50: '0.28s', p90: '0.64s', p99: '1.4s'},
  ],
  '7d': [
    {model: 'lumen-ultra-2', p50: '0.66s', p90: '1.61s', p99: '4.4s'},
    {model: 'lumen-core-2', p50: '0.44s', p90: '1.07s', p99: '2.5s'},
    {model: 'lumen-mini-1', p50: '0.30s', p90: '0.71s', p99: '1.6s'},
  ],
};

const TTFT_SAMPLE: Record<Period, string> = {
  '1h': '2,140 runs sampled',
  '24h': '12,430 runs sampled',
  '7d': '81,204 runs sampled',
};

// --- Usage tab ---

const USAGE_STATS: ReadonlyArray<{
  id: string;
  label: string;
  value: string;
  detail: string;
}> = [
  {id: 'u-1', label: 'Sessions (14d)', value: '51,032', detail: '+8.4% vs prior 14d'},
  {id: 'u-2', label: 'Messages sent', value: '312,480', detail: '+6.1% vs prior 14d'},
  {id: 'u-3', label: 'Tool invocations', value: '128,905', detail: '+11.9% vs prior 14d'},
  {id: 'u-4', label: 'Peak concurrent', value: '312', detail: 'Jul 9, 15:00 UTC'},
];

// Sessions per day, Jun 29 – Jul 12. The last value matches the 24h
// headline stat (4,812).
const USAGE_DAYS: ReadonlyArray<{label: string; value: number; display: string}> = [
  {label: 'Jun 29', value: 3120, display: '3,120'},
  {label: 'Jun 30', value: 3260, display: '3,260'},
  {label: 'Jul 1', value: 3480, display: '3,480'},
  {label: 'Jul 2', value: 2890, display: '2,890'},
  {label: 'Jul 3', value: 2410, display: '2,410'},
  {label: 'Jul 4', value: 3610, display: '3,610'},
  {label: 'Jul 5', value: 3890, display: '3,890'},
  {label: 'Jul 6', value: 4120, display: '4,120'},
  {label: 'Jul 7', value: 3950, display: '3,950'},
  {label: 'Jul 8', value: 3720, display: '3,720'},
  {label: 'Jul 9', value: 2980, display: '2,980'},
  {label: 'Jul 10', value: 4230, display: '4,230'},
  {label: 'Jul 11', value: 4560, display: '4,560'},
  {label: 'Jul 12', value: 4812, display: '4,812'},
];

// ============= USAGE BAR CHART =============
// Single-series column chart: accent marks, hairline gridlines, square
// baseline with 4px rounded caps, per-slot hover with a readout line.

const CHART_W = 560;
const CHART_H = 176;
const PAD_LEFT = 36;
const PAD_RIGHT = 6;
const PAD_TOP = 14;
const PAD_BOTTOM = 20;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;
const Y_MAX = 5000;
const Y_TICKS: ReadonlyArray<{value: number; label: string}> = [
  {value: 0, label: '0'},
  {value: 2500, label: '2.5K'},
  {value: 5000, label: '5K'},
];
const SLOT_W = PLOT_W / USAGE_DAYS.length;
const BAR_W = 24;

// Top-rounded column path: 4px radius at the data end, square baseline.
function columnPath(x: number, y: number, width: number, height: number): string {
  const r = Math.min(4, height);
  const bottom = y + height;
  return [
    \`M\${x},\${bottom}\`,
    \`L\${x},\${y + r}\`,
    \`Q\${x},\${y} \${x + r},\${y}\`,
    \`L\${x + width - r},\${y}\`,
    \`Q\${x + width},\${y} \${x + width},\${y + r}\`,
    \`L\${x + width},\${bottom}\`,
    'Z',
  ].join(' ');
}

function UsageBarChart({isCompact}: {isCompact: boolean}) {
  // Default readout is the current day; hover retargets it.
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const activeIndex = hoverIndex ?? USAGE_DAYS.length - 1;
  const active = USAGE_DAYS[activeIndex];
  const labelStep = isCompact ? 3 : 2;
  const lastIndex = USAGE_DAYS.length - 1;

  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <span style={styles.eyebrow}>Sessions per day · last 14 days</span>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {active.label} · {active.display} sessions
        </Text>
      </HStack>
      <svg
        viewBox={\`0 0 \${CHART_W} \${CHART_H}\`}
        style={styles.chartSvg}
        role="img"
        aria-label="Bar chart of sessions per day for the last 14 days, peaking at 4,812 on Jul 12">
        {/* Hairline gridlines + y ticks (recessive, text tokens). */}
        {Y_TICKS.map(tick => {
          const y = PAD_TOP + PLOT_H - (tick.value / Y_MAX) * PLOT_H;
          return (
            <g key={tick.value}>
              <line
                x1={PAD_LEFT}
                x2={CHART_W - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <text
                x={PAD_LEFT - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--color-text-secondary)">
                {tick.label}
              </text>
            </g>
          );
        })}
        {USAGE_DAYS.map((day, index) => {
          const slotX = PAD_LEFT + index * SLOT_W;
          const barX = slotX + (SLOT_W - BAR_W) / 2;
          const barH = (day.value / Y_MAX) * PLOT_H;
          const barY = PAD_TOP + PLOT_H - barH;
          const isHovered = hoverIndex === index;
          return (
            <g
              key={day.label}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}>
              {/* Slot-wide hover target + tint (bigger than the mark). */}
              <rect
                x={slotX}
                y={PAD_TOP}
                width={SLOT_W}
                height={PLOT_H}
                fill={isHovered ? 'var(--color-background-muted)' : 'transparent'}
              />
              <path
                d={columnPath(barX, barY, BAR_W, barH)}
                fill="var(--color-accent)"
              />
              {/* Selective direct label: the current day only. */}
              {index === lastIndex && (
                <text
                  x={slotX + SLOT_W / 2}
                  y={barY - 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--color-text-secondary)">
                  {day.display}
                </text>
              )}
              {index % labelStep === labelStep - 1 && (
                <text
                  x={slotX + SLOT_W / 2}
                  y={CHART_H - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--color-text-secondary)">
                  {day.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </VStack>
  );
}

// ============= HEALTH =============

function UptimeRow({service, scenario}: {service: Service; scenario: Scenario}) {
  const override = todayOverride(service.id, scenario);
  return (
    <VStack gap={1} style={styles.serviceRow}>
      <HStack gap={2} vAlign="center">
        <Text type="label">{service.name}</Text>
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            {service.incidents}
          </Text>
        </StackItem>
        <Text type="supporting" hasTabularNumbers>
          {service.uptime}
        </Text>
      </HStack>
      <div style={styles.uptimeBar}>
        {Array.from({length: 90}, (_, index) => {
          const base: DayStatus = service.days[index] ?? 'ok';
          const status: DayStatus =
            index === 89 && override != null ? override : base;
          return (
            <div
              key={index}
              style={{
                ...styles.uptimeSegment,
                backgroundColor: DAY_STATUS_COLOR[status],
              }}
              title={\`\${healthDayLabel(index)} · \${DAY_STATUS_LABEL[status]}\`}
            />
          );
        })}
      </div>
    </VStack>
  );
}

// ============= PAGE =============

export default function SystemStatusPageTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;

  const [scenario, setScenario] = useState<Scenario>('operational');
  const [tab, setTab] = useState<TabId>('errors');
  const [period, setPeriod] = useState<Period>('24h');

  const band = SCENARIOS[scenario];

  const statusBand = (
    <div style={{...styles.band, ...band.bandStyle}}>
      <VStack gap={1}>
        {isCompact ? (
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <StatusDot
                variant={band.dot}
                label={band.dotLabel}
                isPulsing={scenario !== 'operational'}
              />
              <Heading level={1}>{band.heading}</Heading>
            </HStack>
            <Text type="supporting" color="secondary">
              Updated 2 min ago
            </Text>
          </VStack>
        ) : (
          <HStack gap={3} vAlign="center">
            <StatusDot
              variant={band.dot}
              label={band.dotLabel}
              isPulsing={scenario !== 'operational'}
            />
            <StackItem size="fill">
              <Heading level={1}>{band.heading}</Heading>
            </StackItem>
            <Text type="supporting" color="secondary">
              Updated 2 min ago
            </Text>
          </HStack>
        )}
        {band.note != null && (
          <Text type="supporting" color="secondary">
            {band.note}
          </Text>
        )}
      </VStack>
    </div>
  );

  const errorsTab = (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <span style={styles.eyebrow}>Top errors (24h)</span>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            1,037 events across 38 sessions
          </Text>
        </HStack>
        <Card padding={0}>
          <Table density="compact" dividers="rows" hasHover>
            <TableHeader>
              <TableRow isHeaderRow>
                <TableHeaderCell scope="col">Error</TableHeaderCell>
                <TableHeaderCell
                  scope="col"
                  style={{width: 96, minWidth: 96, textAlign: 'right'}}>
                  Count
                </TableHeaderCell>
                {!isCompact && (
                  <TableHeaderCell
                    scope="col"
                    style={{width: 88, minWidth: 88, textAlign: 'right'}}>
                    Users
                  </TableHeaderCell>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_ERRORS.map(error => (
                <TableRow key={error.id}>
                  <TableCell>
                    <Text
                      type="code"
                      size="sm"
                      maxLines={1}
                      style={styles.monoCell}>
                      {error.title}
                    </Text>
                  </TableCell>
                  <TableCell style={styles.numCell}>
                    <Text type="supporting" hasTabularNumbers>
                      {error.count}
                    </Text>
                  </TableCell>
                  {!isCompact && (
                    <TableCell style={styles.numCell}>
                      <Text
                        type="supporting"
                        color="secondary"
                        hasTabularNumbers>
                        {error.users}
                      </Text>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </VStack>

      <Grid columns={{minWidth: 340, max: 2}} gap={4}>
        <VStack gap={2}>
          <span style={styles.eyebrow}>By error type</span>
          <Card padding={3}>
            <VStack gap={0}>
              {ERROR_TYPES.map((type, index) => (
                <VStack key={type.id} gap={0}>
                  <VStack gap={1} style={styles.breakdownRow}>
                    <HStack gap={2} vAlign="center">
                      <StackItem size="fill">
                        <Text type="supporting">{type.label}</Text>
                      </StackItem>
                      <Text
                        type="supporting"
                        color="secondary"
                        hasTabularNumbers>
                        {type.count}
                      </Text>
                    </HStack>
                    <div style={styles.typeTrack}>
                      <div
                        style={{
                          ...styles.typeFill,
                          width: \`\${(type.count / ERROR_TYPE_MAX) * 100}%\`,
                        }}
                      />
                    </div>
                  </VStack>
                  {index < ERROR_TYPES.length - 1 && <Divider />}
                </VStack>
              ))}
            </VStack>
          </Card>
        </VStack>

        <VStack gap={2}>
          <span style={styles.eyebrow}>By release</span>
          <Card padding={3}>
            <VStack gap={0}>
              {BY_RELEASE.map((release, index) => (
                <VStack key={release.id} gap={0}>
                  <HStack gap={2} vAlign="center" style={styles.breakdownRow}>
                    <span style={styles.monoCell}>{release.sha}</span>
                    <StackItem size="fill">
                      <Text type="supporting" color="secondary" maxLines={1}>
                        {release.branch}
                      </Text>
                    </StackItem>
                    <Text type="supporting" hasTabularNumbers>
                      {release.pct}%
                    </Text>
                  </HStack>
                  {index < BY_RELEASE.length - 1 && <Divider />}
                </VStack>
              ))}
              <Divider />
              <HStack gap={2} vAlign="center" style={styles.breakdownRow}>
                <StackItem size="fill">
                  <Text type="supporting" color="secondary">
                    Share of 24h error events by deployed release
                  </Text>
                </StackItem>
                <Text type="supporting" color="secondary">
                  last deploy 11:20 UTC
                </Text>
              </HStack>
            </VStack>
          </Card>
        </VStack>
      </Grid>
    </VStack>
  );

  const healthTab = (
    <VStack gap={2}>
      <HStack gap={3} vAlign="center">
        <StackItem size="fill">
          <span style={styles.eyebrow}>Uptime · last 90 days</span>
        </StackItem>
        {(['ok', 'degraded', 'down'] as const).map(status => (
          <HStack key={status} gap={1} vAlign="center">
            <div
              style={{
                ...styles.legendSwatch,
                backgroundColor: DAY_STATUS_COLOR[status],
              }}
            />
            <Text type="supporting" color="secondary">
              {DAY_STATUS_LABEL[status]}
            </Text>
          </HStack>
        ))}
      </HStack>
      <Card padding={4}>
        <VStack gap={0}>
          {SERVICES.map((service, index) => (
            <VStack key={service.id} gap={0}>
              <UptimeRow service={service} scenario={scenario} />
              {index < SERVICES.length - 1 && <Divider />}
            </VStack>
          ))}
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                90 days ago
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary">
              Today
            </Text>
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );

  const performanceTab = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <span style={styles.eyebrow}>Time to first token</span>
        </StackItem>
        <SegmentedControl
          value={period}
          onChange={value => setPeriod(value as Period)}
          label="TTFT period"
          size="sm">
          <SegmentedControlItem value="1h" label="1h" />
          <SegmentedControlItem value="24h" label="24h" />
          <SegmentedControlItem value="7d" label="7d" />
        </SegmentedControl>
      </HStack>
      <Card padding={0}>
        <Table density="compact" dividers="rows">
          <TableHeader>
            <TableRow isHeaderRow>
              <TableHeaderCell scope="col">Model</TableHeaderCell>
              <TableHeaderCell
                scope="col"
                style={{width: 96, minWidth: 96, textAlign: 'right'}}>
                p50
              </TableHeaderCell>
              <TableHeaderCell
                scope="col"
                style={{width: 96, minWidth: 96, textAlign: 'right'}}>
                p90
              </TableHeaderCell>
              <TableHeaderCell
                scope="col"
                style={{width: 96, minWidth: 96, textAlign: 'right'}}>
                p99
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TTFT_ROWS[period].map(row => (
              <TableRow key={row.model}>
                <TableCell>
                  <span style={styles.monoCell}>{row.model}</span>
                </TableCell>
                <TableCell style={styles.numCell}>
                  <Text type="supporting" hasTabularNumbers>
                    {row.p50}
                  </Text>
                </TableCell>
                <TableCell style={styles.numCell}>
                  <Text type="supporting" hasTabularNumbers>
                    {row.p90}
                  </Text>
                </TableCell>
                <TableCell style={styles.numCell}>
                  <Text type="supporting" hasTabularNumbers>
                    {row.p99}
                  </Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        Measured server-side from request accept to first streamed token ·{' '}
        {TTFT_SAMPLE[period]}
      </Text>
    </VStack>
  );

  const usageTab = (
    <VStack gap={4}>
      <Grid columns={{minWidth: 200, max: 4}} gap={4}>
        {USAGE_STATS.map(stat => (
          <Card key={stat.id} padding={3}>
            <VStack gap={1}>
              <Text type="supporting" color="secondary">
                {stat.label}
              </Text>
              <span style={styles.statValue}>{stat.value}</span>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {stat.detail}
              </Text>
            </VStack>
          </Card>
        ))}
      </Grid>
      <Card padding={4}>
        <UsageBarChart isCompact={isCompact} />
      </Card>
    </VStack>
  );

  const tabContent: Record<TabId, ReactNode> = {
    errors: errorsTab,
    health: healthTab,
    performance: performanceTab,
    usage: usageTab,
  };

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <Icon icon={ActivityIcon} size="md" color="accent" />
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={2}>{BRAND_NAME}</Heading>
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    {STATUS_DOMAIN}
                  </Text>
                )}
              </HStack>
            </StackItem>
            {/* Page-chrome demo control: flips the scenario fixtures. */}
            <Selector
              label="Status scenario"
              isLabelHidden
              size="sm"
              options={SCENARIO_OPTIONS}
              value={scenario}
              onChange={value => setScenario(value as Scenario)}
            />
            <Button
              label="Subscribe to updates"
              variant="ghost"
              size="sm"
              icon={<Icon icon={RssIcon} size="sm" color="inherit" />}
              onClick={() => {}}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div ref={wrapRef} style={styles.column}>
            <VStack gap={5}>
              {statusBand}

              {/* Headline stats: left-border dividers, big tabular numbers. */}
              <Grid columns={{minWidth: 200, max: 4}} gap={4}>
                {HEADER_STATS.map(stat => (
                  <div key={stat.id} style={styles.statBlock}>
                    <VStack gap={1}>
                      <Text type="supporting" color="secondary">
                        {stat.label}
                      </Text>
                      <span style={styles.statValue}>{stat.value}</span>
                      <Text
                        type="supporting"
                        color="secondary"
                        hasTabularNumbers>
                        {stat.detail}
                      </Text>
                    </VStack>
                  </div>
                ))}
              </Grid>

              <VStack gap={4}>
                <TabList
                  value={tab}
                  onChange={value => setTab(value as TabId)}
                  hasDivider
                  aria-label="Status sections">
                  <Tab value="errors" label="Errors" />
                  <Tab value="health" label="Health" />
                  <Tab value="performance" label="Performance" />
                  <Tab value="usage" label="Usage" />
                </TabList>
                {tabContent[tab]}
              </VStack>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};