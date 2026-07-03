// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (10 quality monitors across three
 *   warehouse tables — freshness, volume, schema-drift, and null-rate
 *   checks — each with 30 fixed run-history points, per-check slider
 *   bounds, fixed last-run stamps, one seeded snoozed monitor, and one
 *   active volume-collapse incident with a six-event breach timeline)
 * @output Data-quality monitor console: header with pass/warn/fail summary
 *   chips that double as status filters plus a muted count caption; an
 *   active-incident Banner whose "View timeline" drills into the failing
 *   monitor; a search TextInput and warehouse-table SegmentedControl over
 *   a monitor Table with check-type Tokens, inline SVG trend sparklines
 *   (30-point polyline + dashed threshold), and last-run status dots; a
 *   docked detail drawer (end LayoutPanel, Dialog below 1080px) with a
 *   MetadataList, a larger run-history SVG chart with threshold line and
 *   shaded violation band, a threshold Slider that live-recomputes breach
 *   counts / band / projected status before Save, Snooze and confirm-Mute
 *   actions, and — on the incident monitor — a breach timeline Card with
 *   an Acknowledge action that downgrades the fail chip to warn; and a
 *   collapsible "Muted & snoozed" section whose Resume buttons return
 *   monitors to the active table with the header chips recounting
 * @position Page template; emitted by `astryx template data-quality-monitors`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (database
 * icon + "Data Quality" title, monitor-count caption, pass/warn/fail chip
 * Buttons, muted caption). LayoutContent is one scroll column: incident
 * Banner, search + table filter row, monitor Table, muted section.
 * LayoutPanel end 360 docks the monitor detail drawer when one is selected.
 *
 * Interaction contract:
 * - Status is *derived*, never stored: the latest history point breaching
 *   the threshold = Fail, a breach anywhere in the last six runs = Warn,
 *   otherwise Pass. Saving a new threshold therefore recomputes the row
 *   dot, the sparkline threshold line, and the header chips in one pass.
 * - Dragging the drawer Slider edits a *draft* threshold: the chart's
 *   violation band, breach-point dots, breach count, and projected status
 *   Badge all track the draft live; Save commits it to the table and
 *   chips, Reset discards it.
 * - Snooze moves the monitor to the muted section immediately; Mute asks
 *   for confirmation in a Dialog first. Both drop the monitor out of the
 *   chip counts; Resume is the undo path and recounts on the way back.
 * - Acknowledging the seeded incident downgrades its monitor's Fail to
 *   Warn everywhere (chips, row, drawer) and calms the Banner.
 *
 * Responsive contract:
 * - >=1081px: detail drawer docks as a 360px end LayoutPanel beside the
 *   table; header chips sit inline with the title.
 * - <=1080px: the end panel is withheld and the same drawer content opens
 *   in a Dialog (min(560px, 94vw)) — a single-pane fallback, so the table
 *   always keeps full width.
 * - <=900px: the warehouse Table column hides and folds into the monitor
 *   cell caption.
 * - <=640px: the header chips wrap onto their own row below the title;
 *   the Check column folds into the monitor cell as a Token; the trend
 *   and status columns narrow so name, sparkline, status, and the ~40px
 *   details button fit 375px with no horizontal scroll; search and the
 *   table filter stack vertically.
 */

import {useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Code} from '@astryxdesign/core/Code';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Slider} from '@astryxdesign/core/Slider';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  BellOffIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DatabaseIcon,
  MoonIcon,
  SearchIcon,
  SirenIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============
// Plain inline styles using Astryx design-token CSS variables. The SVG
// charts are hand-rolled polylines over fixture arrays — no chart engine.

const CHART_W = 320;
const CHART_H = 140;
const CHART_PAD = 10;
const SPARK_W = 88;
const SPARK_H = 26;
const SPARK_PAD = 3;

const styles: Record<string, CSSProperties> = {
  headerRow: {width: '100%'},
  // Status chips are real Buttons (they filter), so they need to wrap as a
  // group on phones instead of crushing the title.
  chipRow: {flexWrap: 'wrap'},
  chart: {width: '100%', height: 'auto', display: 'block'},
  sparkline: {display: 'block'},
  drawerScroll: {
    overflowY: 'auto',
    height: '100%',
  },
  dialogBody: {padding: 'var(--spacing-4)'},
  timelineRail: {
    // Timeline rows hang off a 2px rail so breach clusters read as one arc.
    borderInlineStart: '2px solid var(--color-border-primary)',
    paddingInlineStart: 'var(--spacing-3)',
  },
  fullWidth: {width: '100%'},
};

// ============= DATA =============
// Deterministic fixtures: fixed run histories, fixed timestamps, no
// clocks, no randomness, no network assets.

type CheckType = 'freshness' | 'volume' | 'schema-drift' | 'null-rate';
type Direction = 'above' | 'below';
type RunStatus = 'pass' | 'warn' | 'fail';
type MuteReason = 'muted' | 'snoozed';

interface Monitor extends Record<string, unknown> {
  id: string;
  name: string;
  table: string;
  check: CheckType;
  /** Breach when the run value is above/below the threshold. */
  direction: Direction;
  threshold: number;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  /** 30 run values, oldest → newest. */
  history: number[];
  lastRun: string;
  cadence: string;
  muteReason?: MuteReason;
  snoozeUntil?: string;
}

const TABLES = [
  'analytics.orders_daily',
  'raw.events_stream',
  'core.customers_dim',
] as const;

const TABLE_SHORT: Record<string, string> = {
  'analytics.orders_daily': 'orders',
  'raw.events_stream': 'events',
  'core.customers_dim': 'customers',
};

const CHECK_META: Record<
  CheckType,
  {label: string; color: 'blue' | 'purple' | 'orange' | 'teal'; unit: string}
> = {
  freshness: {label: 'freshness', color: 'blue', unit: 'min'},
  volume: {label: 'volume', color: 'teal', unit: 'k rows'},
  'schema-drift': {label: 'schema drift', color: 'purple', unit: 'cols'},
  'null-rate': {label: 'null rate', color: 'orange', unit: '%'},
};

const INITIAL_MONITORS: Monitor[] = [
  {
    id: 'm-01',
    name: 'orders_load_lag',
    table: 'analytics.orders_daily',
    check: 'freshness',
    direction: 'above',
    threshold: 90,
    sliderMin: 15,
    sliderMax: 240,
    sliderStep: 5,
    history: [
      42, 38, 55, 61, 47, 52, 44, 58, 63, 49, 41, 56, 60, 45, 39, 54, 66, 71,
      48, 43, 57, 62, 50, 46, 59, 68, 52, 47, 55, 51,
    ],
    lastRun: '6/30 14:20',
    cadence: 'every 30m',
  },
  {
    id: 'm-02',
    name: 'events_hourly_volume',
    table: 'raw.events_stream',
    check: 'volume',
    direction: 'below',
    threshold: 120,
    sliderMin: 0,
    sliderMax: 400,
    sliderStep: 5,
    // Healthy ~210–245k rows/hr until the 05:00 loader deploy; the last
    // five runs collapse through the 120k floor — the seeded incident.
    history: [
      212, 224, 208, 231, 219, 242, 227, 215, 236, 221, 229, 244, 218, 233,
      226, 239, 214, 230, 222, 235, 217, 228, 241, 206, 182, 141, 96, 71, 52,
      38,
    ],
    lastRun: '6/30 14:00',
    cadence: 'every 1h',
  },
  {
    id: 'm-03',
    name: 'discount_code_nulls',
    table: 'analytics.orders_daily',
    check: 'null-rate',
    direction: 'above',
    threshold: 5,
    sliderMin: 0,
    sliderMax: 15,
    sliderStep: 0.5,
    history: [
      3.1, 3.4, 2.9, 3.6, 3.2, 3.8, 3.5, 3.0, 3.7, 3.3, 3.9, 3.4, 4.1, 3.6,
      4.3, 3.8, 4.0, 4.4, 3.7, 4.2, 4.5, 3.9, 4.6, 4.1, 4.4, 5.4, 4.8, 4.6,
      4.9, 4.7,
    ],
    lastRun: '6/30 14:10',
    cadence: 'every 1h',
  },
  {
    id: 'm-04',
    name: 'events_schema_drift',
    table: 'raw.events_stream',
    check: 'schema-drift',
    direction: 'above',
    threshold: 1,
    sliderMin: 0,
    sliderMax: 6,
    sliderStep: 1,
    history: [
      0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
      0, 2, 0, 0, 0, 0,
    ],
    lastRun: '6/30 13:45',
    cadence: 'every 6h',
  },
  {
    id: 'm-05',
    name: 'events_ingest_lag',
    table: 'raw.events_stream',
    check: 'freshness',
    direction: 'above',
    threshold: 45,
    sliderMin: 5,
    sliderMax: 120,
    sliderStep: 5,
    history: [
      12, 15, 11, 18, 14, 16, 13, 19, 15, 12, 17, 14, 20, 16, 13, 18, 15, 21,
      14, 17, 12, 16, 19, 13, 15, 22, 18, 14, 16, 15,
    ],
    lastRun: '6/30 14:25',
    cadence: 'every 15m',
  },
  {
    id: 'm-06',
    name: 'orders_daily_volume',
    table: 'analytics.orders_daily',
    check: 'volume',
    direction: 'below',
    threshold: 40,
    sliderMin: 0,
    sliderMax: 150,
    sliderStep: 5,
    history: [
      74, 78, 71, 82, 76, 69, 80, 73, 85, 77, 70, 79, 83, 72, 75, 81, 68, 76,
      84, 74, 78, 71, 80, 86, 73, 77, 82, 75, 79, 76,
    ],
    lastRun: '6/30 14:05',
    cadence: 'every 1h',
  },
  {
    id: 'm-07',
    name: 'email_null_rate',
    table: 'core.customers_dim',
    check: 'null-rate',
    direction: 'above',
    threshold: 6,
    sliderMin: 0,
    sliderMax: 20,
    sliderStep: 0.5,
    history: [
      4.2, 4.5, 4.1, 4.8, 4.4, 5.0, 4.6, 4.3, 4.9, 4.5, 5.1, 4.7, 5.3, 4.8,
      5.0, 5.4, 4.9, 5.2, 5.5, 5.0, 5.3, 5.6, 5.1, 5.7, 6.8, 5.9, 5.6, 5.8,
      5.5, 5.7,
    ],
    lastRun: '6/30 13:50',
    cadence: 'every 2h',
  },
  {
    id: 'm-08',
    name: 'customers_schema_drift',
    table: 'core.customers_dim',
    check: 'schema-drift',
    direction: 'above',
    threshold: 1,
    sliderMin: 0,
    sliderMax: 6,
    sliderStep: 1,
    history: [
      0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
    ],
    lastRun: '6/30 12:00',
    cadence: 'every 6h',
  },
  {
    id: 'm-09',
    name: 'customers_dim_lag',
    table: 'core.customers_dim',
    check: 'freshness',
    direction: 'above',
    threshold: 120,
    sliderMin: 15,
    sliderMax: 360,
    sliderStep: 15,
    history: [
      72, 68, 81, 75, 88, 70, 79, 84, 73, 90, 76, 82, 69, 85, 78, 71, 86, 80,
      74, 89, 77, 83, 72, 87, 79, 75, 84, 81, 76, 82,
    ],
    lastRun: '6/30 09:00',
    cadence: 'every 2h',
    // Seeded into the muted section so it renders on first paint.
    muteReason: 'snoozed',
    snoozeUntil: '7/1 09:00',
  },
  {
    id: 'm-10',
    name: 'customers_row_count',
    table: 'core.customers_dim',
    check: 'volume',
    direction: 'below',
    threshold: 10,
    sliderMin: 0,
    sliderMax: 60,
    sliderStep: 1,
    history: [
      22, 24, 21, 25, 23, 20, 24, 22, 26, 23, 21, 25, 22, 24, 20, 23, 25, 21,
      24, 22, 26, 23, 21, 25, 22, 24, 20, 23, 25, 22,
    ],
    lastRun: '6/30 14:15',
    cadence: 'every 1h',
  },
];

interface IncidentEvent {
  time: string;
  kind: 'breach' | 'notify' | 'note';
  label: string;
}

const INCIDENT = {
  id: 'INC-2094',
  monitorId: 'm-02',
  openedAt: '6/30 06:30',
  title: 'Volume collapse on raw.events_stream',
  summary:
    'Hourly event volume fell through the 120k floor after the 05:00 ' +
    'loader deploy and is still dropping. Rollback of loader v2.14 is in ' +
    'flight.',
  events: [
    {
      time: '6/30 05:12',
      kind: 'note',
      label: 'loader v2.14 deployed to ingest workers',
    },
    {
      time: '6/30 06:30',
      kind: 'breach',
      label: 'run at 96k rows/hr — below 120k floor',
    },
    {
      time: '6/30 07:00',
      kind: 'breach',
      label: 'run at 71k rows/hr — below 120k floor',
    },
    {
      time: '6/30 07:02',
      kind: 'notify',
      label: 'paged #data-oncall via PagerDuty',
    },
    {
      time: '6/30 07:30',
      kind: 'breach',
      label: 'run at 52k rows/hr — below 120k floor',
    },
    {
      time: '6/30 08:00',
      kind: 'breach',
      label: 'run at 38k rows/hr — below 120k floor',
    },
  ] as IncidentEvent[],
};

const SNOOZE_UNTIL = '7/1 09:00';
const MUTED_BY = 'djp@acme.dev';

// ============= STATUS VOCABULARY =============
// Status is derived from history + threshold at render time, so a saved
// threshold edit repaints the row dot, sparkline, and chips in one pass.

const STATUS: Record<
  RunStatus,
  {
    label: string;
    dot: 'success' | 'warning' | 'error';
    badge: 'success' | 'warning' | 'error';
  }
> = {
  pass: {label: 'Pass', dot: 'success', badge: 'success'},
  warn: {label: 'Warn', dot: 'warning', badge: 'warning'},
  fail: {label: 'Fail', dot: 'error', badge: 'error'},
};

function breaches(value: number, threshold: number, direction: Direction) {
  return direction === 'above' ? value > threshold : value < threshold;
}

/** Latest run breaching = fail; a breach in the last 6 runs = warn. */
function runStatusOf(
  history: number[],
  threshold: number,
  direction: Direction,
): RunStatus {
  const latest = history[history.length - 1];
  if (breaches(latest, threshold, direction)) {
    return 'fail';
  }
  if (history.slice(-6).some(v => breaches(v, threshold, direction))) {
    return 'warn';
  }
  return 'pass';
}

function breachCountOf(
  history: number[],
  threshold: number,
  direction: Direction,
): number {
  return history.filter(v => breaches(v, threshold, direction)).length;
}

function formatValue(check: CheckType, value: number): string {
  switch (check) {
    case 'freshness':
      return `${value} min`;
    case 'volume':
      return `${value}k rows`;
    case 'schema-drift':
      return `${value} cols`;
    case 'null-rate':
      return `${value}%`;
  }
}

function directionLabel(direction: Direction): string {
  return direction === 'above' ? 'fails above' : 'fails below';
}

// ============= SVG CHARTS =============
// Both charts are plain SVG over the fixture arrays. The y-domain is the
// monitor's slider range, so the threshold line and violation band stay
// on-chart at every draft value and the geometry never jumps mid-drag.

function chartY(
  value: number,
  min: number,
  max: number,
  height: number,
  pad: number,
): number {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return height - pad - t * (height - 2 * pad);
}

/** Row-level trend: 30-point polyline + dashed saved-threshold line. */
function TrendSparkline({monitor, status}: {monitor: Monitor; status: RunStatus}) {
  const lo = Math.min(...monitor.history, monitor.threshold);
  const hi = Math.max(...monitor.history, monitor.threshold);
  const span = hi - lo || 1;
  const x = (i: number) =>
    SPARK_PAD + (i * (SPARK_W - 2 * SPARK_PAD)) / (monitor.history.length - 1);
  const y = (v: number) => chartY(v, lo, lo + span, SPARK_H, SPARK_PAD);
  const points = monitor.history
    .map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ');
  const latest = monitor.history[monitor.history.length - 1];
  const thresholdY = y(monitor.threshold);
  return (
    <svg
      width={SPARK_W}
      height={SPARK_H}
      viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
      style={styles.sparkline}
      role="img"
      aria-label={`${monitor.name} trend: last run ${formatValue(
        monitor.check,
        latest,
      )}, threshold ${formatValue(monitor.check, monitor.threshold)}`}>
      <line
        x1={SPARK_PAD}
        x2={SPARK_W - SPARK_PAD}
        y1={thresholdY}
        y2={thresholdY}
        stroke="var(--color-icon-red)"
        strokeWidth={1}
        strokeDasharray="3 3"
        opacity={0.6}
      />
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-icon-blue)"
        strokeWidth={1.5}
      />
      <circle
        cx={x(monitor.history.length - 1)}
        cy={y(latest)}
        r={2.5}
        fill={
          status === 'pass'
            ? 'var(--color-icon-green)'
            : status === 'warn'
              ? 'var(--color-icon-yellow)'
              : 'var(--color-icon-red)'
        }
      />
    </svg>
  );
}

/**
 * Drawer chart: run history against a *draft* threshold. The shaded rect
 * is the violation band (the failing side of the threshold), breaching
 * points fill red, and everything repaints as the Slider drags.
 */
function HistoryChart({
  monitor,
  draftThreshold,
}: {
  monitor: Monitor;
  draftThreshold: number;
}) {
  const {sliderMin: lo, sliderMax: hi} = monitor;
  const count = monitor.history.length;
  const x = (i: number) =>
    CHART_PAD + (i * (CHART_W - 2 * CHART_PAD)) / (count - 1);
  const y = (v: number) => chartY(v, lo, hi, CHART_H, CHART_PAD);
  const points = monitor.history
    .map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ');
  const ty = y(draftThreshold);
  // Violation band shades the breaching side of the draft threshold.
  const bandY = monitor.direction === 'above' ? CHART_PAD : ty;
  const bandH =
    monitor.direction === 'above' ? ty - CHART_PAD : CHART_H - CHART_PAD - ty;
  const breachCount = breachCountOf(
    monitor.history,
    draftThreshold,
    monitor.direction,
  );
  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      style={styles.chart}
      role="img"
      aria-label={`${monitor.name} run history: 30 runs, ${breachCount} breach ${
        monitor.direction === 'above' ? 'above' : 'below'
      } the draft threshold of ${formatValue(monitor.check, draftThreshold)}`}>
      {bandH > 0 && (
        <rect
          x={CHART_PAD}
          y={bandY}
          width={CHART_W - 2 * CHART_PAD}
          height={bandH}
          fill="var(--color-icon-red)"
          opacity={0.08}
        />
      )}
      <line
        x1={CHART_PAD}
        x2={CHART_W - CHART_PAD}
        y1={ty}
        y2={ty}
        stroke="var(--color-icon-red)"
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-icon-blue)"
        strokeWidth={2}
      />
      {monitor.history.map((v, i) => {
        const isBreach = breaches(v, draftThreshold, monitor.direction);
        return (
          <circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r={isBreach ? 3 : 2}
            fill={isBreach ? 'var(--color-icon-red)' : 'var(--color-icon-blue)'}
          />
        );
      })}
    </svg>
  );
}

// ============= INCIDENT TIMELINE =============

const EVENT_DOT: Record<IncidentEvent['kind'], 'error' | 'accent' | 'neutral'> =
  {
    breach: 'error',
    notify: 'accent',
    note: 'neutral',
  };

function IncidentTimeline({
  acked,
  onAcknowledge,
}: {
  acked: boolean;
  onAcknowledge: () => void;
}) {
  return (
    <Card variant="muted" padding={3}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon
            icon={SirenIcon}
            size="sm"
            color={acked ? 'secondary' : 'primary'}
          />
          <StackItem size="fill">
            <Text type="label" size="sm">
              {INCIDENT.id} · opened {INCIDENT.openedAt}
            </Text>
          </StackItem>
          <Badge
            variant={acked ? 'warning' : 'error'}
            label={acked ? 'Acknowledged' : 'Active'}
          />
        </HStack>
        <Text type="supporting" color="secondary">
          {INCIDENT.summary}
        </Text>
        <div style={styles.timelineRail}>
          <VStack gap={2}>
            {INCIDENT.events.map(event => (
              <HStack key={`${event.time}-${event.label}`} gap={2} vAlign="center">
                <StatusDot
                  variant={EVENT_DOT[event.kind]}
                  label={`${event.kind} event`}
                />
                <StackItem size="fill">
                  <Text size="sm">{event.label}</Text>
                </StackItem>
                <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
                  {event.time}
                </Text>
              </HStack>
            ))}
          </VStack>
        </div>
        {acked ? (
          <Text type="supporting" size="sm" color="secondary">
            Acknowledged by <Code>{MUTED_BY}</Code> — status held at Warn until
            volume recovers above the floor.
          </Text>
        ) : (
          <Button
            label="Acknowledge incident"
            variant="secondary"
            size="sm"
            icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
            onClick={onAcknowledge}
          />
        )}
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

type StatusFilter = RunStatus | 'all';
type TableFilter = 'all' | (typeof TABLES)[number];

export default function DataQualityMonitorsTemplate() {
  const [monitors, setMonitors] = useState<Monitor[]>(INITIAL_MONITORS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Draft threshold for the drawer Slider; null = tracking the saved value.
  const [draft, setDraft] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tableFilter, setTableFilter] = useState<TableFilter>('all');
  const [query, setQuery] = useState('');
  const [incidentAcked, setIncidentAcked] = useState(false);
  const [isMutedOpen, setIsMutedOpen] = useState(true);
  // Mute is the destructive path, so it confirms in a Dialog first.
  const [mutePendingId, setMutePendingId] = useState<string | null>(null);

  // Responsive contract: the detail drawer docks >=1081px and falls back
  // to a Dialog below; <=900px hides the warehouse column; <=640px wraps
  // the header chips and folds the Check column into the monitor cell.
  const hasDockedDetail = !useMediaQuery('(max-width: 1080px)');
  const isCompact = useMediaQuery('(max-width: 900px)');
  const isMobile = useMediaQuery('(max-width: 640px)');

  /** Derived status with the incident-acknowledge downgrade applied. */
  const statusOf = (monitor: Monitor): RunStatus => {
    const status = runStatusOf(
      monitor.history,
      monitor.threshold,
      monitor.direction,
    );
    if (
      status === 'fail' &&
      monitor.id === INCIDENT.monitorId &&
      incidentAcked
    ) {
      return 'warn';
    }
    return status;
  };

  const activeMonitors = monitors.filter(m => m.muteReason == null);
  const mutedMonitors = monitors.filter(m => m.muteReason != null);

  // Header chips count only active monitors — snooze/mute recounts them.
  const counts: Record<RunStatus, number> = {pass: 0, warn: 0, fail: 0};
  for (const monitor of activeMonitors) {
    counts[statusOf(monitor)] += 1;
  }

  const q = query.trim().toLowerCase();
  const visibleMonitors = activeMonitors.filter(monitor => {
    if (tableFilter !== 'all' && monitor.table !== tableFilter) {
      return false;
    }
    if (statusFilter !== 'all' && statusOf(monitor) !== statusFilter) {
      return false;
    }
    if (q !== '') {
      const haystack =
        `${monitor.name} ${monitor.table} ${CHECK_META[monitor.check].label}`.toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const selected = monitors.find(m => m.id === selectedId) ?? null;
  const draftThreshold = draft ?? selected?.threshold ?? 0;
  const isDraftDirty = selected != null && draftThreshold !== selected.threshold;

  const selectMonitor = (id: string | null) => {
    setSelectedId(id);
    setDraft(null);
  };

  const saveThreshold = () => {
    if (selected == null || draft == null) {
      return;
    }
    setMonitors(prev =>
      prev.map(m => (m.id === selected.id ? {...m, threshold: draft} : m)),
    );
    setDraft(null);
  };

  const snoozeMonitor = (id: string) => {
    setMonitors(prev =>
      prev.map(m =>
        m.id === id
          ? {...m, muteReason: 'snoozed' as const, snoozeUntil: SNOOZE_UNTIL}
          : m,
      ),
    );
    setIsMutedOpen(true);
    if (selectedId === id) {
      selectMonitor(null);
    }
  };

  const muteMonitor = (id: string) => {
    setMonitors(prev =>
      prev.map(m =>
        m.id === id
          ? {...m, muteReason: 'muted' as const, snoozeUntil: undefined}
          : m,
      ),
    );
    setMutePendingId(null);
    setIsMutedOpen(true);
    if (selectedId === id) {
      selectMonitor(null);
    }
  };

  // Resume is the undo for both snooze and mute: back into the table and
  // the chip counts in one click.
  const resumeMonitor = (id: string) => {
    setMonitors(prev =>
      prev.map(m =>
        m.id === id ? {...m, muteReason: undefined, snoozeUntil: undefined} : m,
      ),
    );
  };

  const toggleStatusFilter = (status: RunStatus) => {
    setStatusFilter(prev => (prev === status ? 'all' : status));
  };

  const incidentMonitor = monitors.find(m => m.id === INCIDENT.monitorId);
  const isIncidentLive =
    incidentMonitor != null &&
    incidentMonitor.muteReason == null &&
    runStatusOf(
      incidentMonitor.history,
      incidentMonitor.threshold,
      incidentMonitor.direction,
    ) === 'fail';

  // ---- header chips: pass/warn/fail Buttons that filter the table ----

  const statusChips = (
    <HStack gap={2} vAlign="center" style={styles.chipRow}>
      {(['pass', 'warn', 'fail'] as const).map(status => (
        <Button
          key={status}
          label={`${counts[status]} ${STATUS[status].label.toLowerCase()}`}
          variant={statusFilter === status ? 'secondary' : 'ghost'}
          size="sm"
          icon={
            <StatusDot
              variant={STATUS[status].dot}
              label=""
              isPulsing={status === 'fail' && counts.fail > 0 && !incidentAcked}
            />
          }
          tooltip={
            statusFilter === status
              ? 'Show all statuses'
              : `Show only ${STATUS[status].label.toLowerCase()}ing monitors`
          }
          onClick={() => toggleStatusFilter(status)}
        />
      ))}
      <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
        {mutedMonitors.length} muted
      </Text>
    </HStack>
  );

  // ---- detail drawer (docked panel >=1081px, Dialog below) ----

  const projectedStatus =
    selected == null
      ? null
      : runStatusOf(selected.history, draftThreshold, selected.direction);
  const draftBreaches =
    selected == null
      ? 0
      : breachCountOf(selected.history, draftThreshold, selected.direction);

  const detail = selected != null && (
    <VStack gap={3}>
      {hasDockedDetail && (
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="code" size="sm">
                {selected.name}
              </Text>
              <Text type="supporting" size="sm" color="secondary">
                {selected.table}
              </Text>
            </VStack>
          </StackItem>
          <Badge
            variant={STATUS[statusOf(selected)].badge}
            label={STATUS[statusOf(selected)].label}
          />
          <IconButton
            label="Close details"
            tooltip="Close"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={() => selectMonitor(null)}
          />
        </HStack>
      )}
      <MetadataList label={{position: 'start', width: 88}}>
        <MetadataListItem label="Check">
          {CHECK_META[selected.check].label}
        </MetadataListItem>
        <MetadataListItem label="Rule">
          {directionLabel(selected.direction)}{' '}
          {formatValue(selected.check, selected.threshold)}
        </MetadataListItem>
        <MetadataListItem label="Cadence">{selected.cadence}</MetadataListItem>
        <MetadataListItem label="Last run">{selected.lastRun}</MetadataListItem>
      </MetadataList>
      <Divider />
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" size="sm">
              Last 30 runs
            </Text>
          </StackItem>
          <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
            {formatValue(selected.check, selected.sliderMin)} –{' '}
            {formatValue(selected.check, selected.sliderMax)}
          </Text>
        </HStack>
        <HistoryChart monitor={selected} draftThreshold={draftThreshold} />
        <Text type="supporting" size="sm" color="secondary">
          Shaded band and red points mark runs that would breach the draft
          threshold.
        </Text>
      </VStack>
      <Slider
        label={`Threshold (${CHECK_META[selected.check].unit})`}
        min={selected.sliderMin}
        max={selected.sliderMax}
        step={selected.sliderStep}
        value={draftThreshold}
        onChange={setDraft}
        formatValue={v => formatValue(selected.check, v)}
        valueDisplay="text"
      />
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="supporting" size="sm" hasTabularNumbers>
            {draftBreaches} of {selected.history.length} runs breach{' '}
            {formatValue(selected.check, draftThreshold)}
          </Text>
        </StackItem>
        {projectedStatus != null && (
          <HStack gap={1} vAlign="center">
            <Text type="supporting" size="sm" color="secondary">
              projected
            </Text>
            <Badge
              variant={STATUS[projectedStatus].badge}
              label={STATUS[projectedStatus].label}
            />
          </HStack>
        )}
      </HStack>
      <HStack gap={2}>
        <Button
          label="Save threshold"
          variant="primary"
          size="sm"
          isDisabled={!isDraftDirty}
          onClick={saveThreshold}
        />
        <Button
          label="Reset"
          variant="ghost"
          size="sm"
          isDisabled={!isDraftDirty}
          onClick={() => setDraft(null)}
        />
      </HStack>
      <Divider />
      <HStack gap={2}>
        <Button
          label="Snooze 24h"
          variant="secondary"
          size="sm"
          icon={<Icon icon={MoonIcon} size="sm" color="inherit" />}
          tooltip={`Pause checks until ${SNOOZE_UNTIL}`}
          onClick={() => snoozeMonitor(selected.id)}
        />
        <Button
          label="Mute"
          variant="ghost"
          size="sm"
          icon={<Icon icon={BellOffIcon} size="sm" color="inherit" />}
          tooltip="Stop alerting until resumed"
          onClick={() => setMutePendingId(selected.id)}
        />
      </HStack>
      {selected.id === INCIDENT.monitorId && (
        <IncidentTimeline
          acked={incidentAcked}
          onAcknowledge={() => setIncidentAcked(true)}
        />
      )}
    </VStack>
  );

  // <=1080px single-pane fallback: same drawer content, in a Dialog.
  const detailDialog = !hasDockedDetail && selected != null && (
    <Dialog
      isOpen
      onOpenChange={open => {
        if (!open) {
          selectMonitor(null);
        }
      }}
      purpose="info"
      width="min(560px, 94vw)">
      <VStack gap={3} style={styles.dialogBody}>
        <DialogHeader
          title={selected.name}
          subtitle={selected.table}
          onOpenChange={open => {
            if (!open) {
              selectMonitor(null);
            }
          }}
        />
        {detail}
      </VStack>
    </Dialog>
  );

  // ---- confirm-mute dialog (destructive action confirms first) ----

  const mutePending = monitors.find(m => m.id === mutePendingId) ?? null;
  const muteDialog = mutePending != null && (
    <Dialog
      isOpen
      onOpenChange={open => {
        if (!open) {
          setMutePendingId(null);
        }
      }}
      purpose="info"
      width="min(420px, 94vw)">
      <VStack gap={3} style={styles.dialogBody}>
        <DialogHeader
          title="Mute this monitor?"
          subtitle={mutePending.name}
          onOpenChange={open => {
            if (!open) {
              setMutePendingId(null);
            }
          }}
        />
        <Text type="supporting" color="secondary">
          Muting stops all alerting for <Code>{mutePending.name}</Code> until
          someone resumes it — breaches will keep landing in the run history
          but nobody gets paged. You can resume it any time from the muted
          section.
        </Text>
        <HStack gap={2} hAlign="end">
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            onClick={() => setMutePendingId(null)}
          />
          <Button
            label="Mute monitor"
            variant="destructive"
            size="sm"
            icon={<Icon icon={BellOffIcon} size="sm" color="inherit" />}
            onClick={() => muteMonitor(mutePending.id)}
          />
        </HStack>
      </VStack>
    </Dialog>
  );

  // ---- muted & snoozed section ----

  const mutedSection = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Button
          label={`Muted & snoozed (${mutedMonitors.length})`}
          variant="ghost"
          size="sm"
          icon={
            <Icon
              icon={isMutedOpen ? ChevronUpIcon : ChevronDownIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={() => setIsMutedOpen(prev => !prev)}
        />
        <Text type="supporting" size="sm" color="secondary">
          excluded from chips and alerting
        </Text>
      </HStack>
      {isMutedOpen &&
        (mutedMonitors.length === 0 ? (
          <Text type="supporting" size="sm" color="secondary">
            Nothing is muted — every monitor is counting toward the chips.
          </Text>
        ) : (
          <Card variant="muted" padding={3}>
            <VStack gap={2}>
              {mutedMonitors.map((monitor, index) => (
                <VStack key={monitor.id} gap={2}>
                  {index > 0 && <Divider />}
                  <HStack gap={2} vAlign="center">
                    <StatusDot variant="neutral" label="Paused" />
                    <StackItem size="fill">
                      <VStack gap={0}>
                        <Text type="code" size="sm" maxLines={1}>
                          {monitor.name}
                        </Text>
                        <Text type="supporting" size="sm" color="secondary">
                          {monitor.table} ·{' '}
                          {monitor.muteReason === 'snoozed'
                            ? `snoozed until ${monitor.snoozeUntil ?? SNOOZE_UNTIL}`
                            : `muted by ${MUTED_BY}`}
                        </Text>
                      </VStack>
                    </StackItem>
                    {!isMobile && (
                      <Badge
                        variant="neutral"
                        label={
                          monitor.muteReason === 'snoozed' ? 'Snoozed' : 'Muted'
                        }
                      />
                    )}
                    <Button
                      label="Resume"
                      variant="secondary"
                      size="sm"
                      icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
                      tooltip="Return to the active table and chip counts"
                      onClick={() => resumeMonitor(monitor.id)}
                    />
                  </HStack>
                </VStack>
              ))}
            </VStack>
          </Card>
        ))}
    </VStack>
  );

  // ---- monitor table ----

  const monitorTable = (
    <Table
      data={visibleMonitors}
      idKey="id"
      density="compact"
      hasHover
      textOverflow="truncate"
      emptyState={
        <EmptyState
          title="No monitors match"
          description="Clear the search, table, or status chip filters to see the full list."
          isCompact
        />
      }
      columns={[
        {
          key: 'name',
          header: 'Monitor',
          width: proportional(1.4),
          renderCell: (monitor: Monitor) => (
            <VStack gap={0}>
              <Text type="code" size="sm" maxLines={1}>
                {monitor.name}
              </Text>
              <HStack gap={1} vAlign="center">
                {/* <=640px the Check column hides; the Token folds in. */}
                {isMobile && (
                  <Token
                    label={CHECK_META[monitor.check].label}
                    size="sm"
                    color={CHECK_META[monitor.check].color}
                  />
                )}
                {isCompact && (
                  <Text type="supporting" size="sm" color="secondary" maxLines={1}>
                    {TABLE_SHORT[monitor.table]}
                  </Text>
                )}
                {!isCompact && (
                  <Text type="supporting" size="sm" color="secondary" maxLines={1}>
                    {directionLabel(monitor.direction)}{' '}
                    {formatValue(monitor.check, monitor.threshold)}
                  </Text>
                )}
              </HStack>
            </VStack>
          ),
        },
        ...(isMobile
          ? []
          : [
              {
                key: 'check',
                header: 'Check',
                width: pixel(118),
                renderCell: (monitor: Monitor) => (
                  <Token
                    label={CHECK_META[monitor.check].label}
                    size="sm"
                    color={CHECK_META[monitor.check].color}
                  />
                ),
              },
            ]),
        ...(isCompact
          ? []
          : [
              {
                key: 'table',
                header: 'Warehouse table',
                width: pixel(190),
                renderCell: (monitor: Monitor) => (
                  <Text type="code" size="sm" color="secondary" maxLines={1}>
                    {monitor.table}
                  </Text>
                ),
              },
            ]),
        {
          key: 'trend',
          header: 'Trend',
          width: pixel(SPARK_W + 16),
          resizable: false,
          renderCell: (monitor: Monitor) => (
            <TrendSparkline monitor={monitor} status={statusOf(monitor)} />
          ),
        },
        {
          key: 'status',
          header: 'Last run',
          width: isMobile ? pixel(110) : pixel(150),
          renderCell: (monitor: Monitor) => {
            const status = statusOf(monitor);
            return (
              <HStack gap={2} vAlign="center">
                <StatusDot
                  variant={STATUS[status].dot}
                  label={`${STATUS[status].label}: ${monitor.name}`}
                />
                <VStack gap={0}>
                  <Text size="sm">{STATUS[status].label}</Text>
                  <Text
                    type="supporting"
                    size="sm"
                    color="secondary"
                    hasTabularNumbers>
                    {monitor.lastRun}
                  </Text>
                </VStack>
              </HStack>
            );
          },
        },
        {
          key: 'details',
          header: '',
          width: pixel(52),
          align: 'end',
          resizable: false,
          renderCell: (monitor: Monitor) => (
            <IconButton
              label={`View details for ${monitor.name}`}
              tooltip="Details"
              icon={<Icon icon={ChevronRightIcon} size="sm" color="inherit" />}
              variant={selectedId === monitor.id ? 'secondary' : 'ghost'}
              size="md"
              onClick={() => selectMonitor(monitor.id)}
            />
          ),
        },
      ]}
    />
  );

  return (
    <>
      {detailDialog}
      {muteDialog}
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <VStack gap={2} style={styles.headerRow}>
              <HStack gap={3} vAlign="center" wrap="wrap">
                <Icon icon={DatabaseIcon} size="md" color="secondary" />
                <StackItem size="fill">
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Heading level={1}>Data Quality</Heading>
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {activeMonitors.length} active monitors ·{' '}
                      {TABLES.length} warehouse tables
                    </Text>
                  </HStack>
                </StackItem>
                {/* >=641px the chips share the title row. */}
                {!isMobile && statusChips}
              </HStack>
              {/* <=640px the chips wrap onto their own full-width row. */}
              {isMobile && statusChips}
            </VStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={3} label="Quality monitors">
            <VStack gap={3}>
              {isIncidentLive && (
                <Banner
                  status={incidentAcked ? 'warning' : 'error'}
                  title={
                    incidentAcked
                      ? `${INCIDENT.id} acknowledged — ${INCIDENT.title}`
                      : `Active incident ${INCIDENT.id} — ${INCIDENT.title}`
                  }
                  description={
                    incidentAcked
                      ? 'Held at Warn while the loader rollback lands. Runs keep recording below the floor.'
                      : 'Five consecutive runs below the 120k rows/hr floor. Open the timeline to acknowledge.'
                  }
                  endContent={
                    <Button
                      label="View timeline"
                      variant="secondary"
                      size="sm"
                      onClick={() => selectMonitor(INCIDENT.monitorId)}
                    />
                  }
                />
              )}
              {/* Search + warehouse filter; stacks <=640px. */}
              {isMobile ? (
                <VStack gap={2}>
                  <TextInput
                    label="Search monitors"
                    isLabelHidden
                    placeholder="Search monitors, tables, checks…"
                    value={query}
                    onChange={setQuery}
                    startIcon={
                      <Icon icon={SearchIcon} size="sm" color="secondary" />
                    }
                  />
                  <SegmentedControl
                    label="Warehouse table"
                    value={tableFilter}
                    onChange={value => setTableFilter(value as TableFilter)}
                    size="sm"
                    layout="fill">
                    <SegmentedControlItem value="all" label="All" />
                    {TABLES.map(table => (
                      <SegmentedControlItem
                        key={table}
                        value={table}
                        label={TABLE_SHORT[table]}
                      />
                    ))}
                  </SegmentedControl>
                </VStack>
              ) : (
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <TextInput
                      label="Search monitors"
                      isLabelHidden
                      placeholder="Search monitors, tables, checks…"
                      value={query}
                      onChange={setQuery}
                      startIcon={
                        <Icon icon={SearchIcon} size="sm" color="secondary" />
                      }
                    />
                  </StackItem>
                  <SegmentedControl
                    label="Warehouse table"
                    value={tableFilter}
                    onChange={value => setTableFilter(value as TableFilter)}
                    size="sm">
                    <SegmentedControlItem value="all" label="All tables" />
                    {TABLES.map(table => (
                      <SegmentedControlItem
                        key={table}
                        value={table}
                        label={TABLE_SHORT[table]}
                      />
                    ))}
                  </SegmentedControl>
                </HStack>
              )}
              {monitorTable}
              <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
                Showing {visibleMonitors.length} of {activeMonitors.length}{' '}
                active monitors
                {statusFilter !== 'all'
                  ? ` · status: ${STATUS[statusFilter].label.toLowerCase()}`
                  : ''}
                {tableFilter !== 'all'
                  ? ` · table: ${TABLE_SHORT[tableFilter]}`
                  : ''}
              </Text>
              <Divider />
              {mutedSection}
            </VStack>
          </LayoutContent>
        }
        end={
          hasDockedDetail && selected != null ? (
            <LayoutPanel width={360} padding={3} hasDivider label="Monitor details">
              <div style={styles.drawerScroll}>{detail}</div>
            </LayoutPanel>
          ) : undefined
        }
      />
    </>
  );
}
