// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (14 feature gates across two rollout
 *   batches plus unbatched strays, fixed 24-hour telemetry counts bucketed
 *   hourly, ranked by-gate/by-event/suppressed count lists, a fixed
 *   last-changed audit line)
 * @output Runtime kill-switch ops console for gated fixes: header with a
 *   gate-count caption and Refresh/Open Sentry ButtonGroup; a 3-card KPI
 *   Grid (Gate State with ProgressBar, Last Changed audit line, Telemetry
 *   Window MetadataList); two rollout-batch Cards with "x/y enabled"
 *   Badges, per-gate Tokens, and Enable/Disable batch Buttons; an amber
 *   "Telemetry degraded" Banner; a dependency-free telemetry Card — 24
 *   vertical div bars in an emerald chart over the mono Sentry query,
 *   beside three ranked count lists whose rows pair a mono label, tabular
 *   count, and thin proportional bar; and a master gate Table combining a
 *   5-state dot health vocabulary (Healthy/Warning/Suppressing/Off/No
 *   signal), Enabled/Disabled Badges, batch Tokens, a prose risk column,
 *   mono Sentry-query Links, and right-aligned Switches
 * @position Page template; emitted by `astryx template feature-gate-console`
 *
 * Frame: Layout height="fill" contentWidth={1120}. LayoutHeader carries the
 * chrome (icon + "Gates" title, enabled-count caption, Refresh/Sentry
 * ButtonGroup). LayoutContent is one scroll column: KPI Grid, batch Cards,
 * warning Banner, telemetry Card, gate Table.
 *
 * Interaction contract:
 * - Health is *derived*, never stored: enabled + events = Healthy, enabled
 *   + thin traffic = Warning, disabled + suppressed events = Suppressing
 *   (the bug is still firing), disabled + quiet = Off, no metrics = No
 *   signal. Flipping a Switch recomputes the dot, the Badges, the KPI
 *   count, and the batch cards in one pass.
 * - Batch buttons enable/disable every gate in the batch; each button
 *   disables itself once the batch is already fully in that state (Batch 1
 *   starts 5/5, so only "Disable this batch" is active).
 * - One row (fix_emoji_strip) is frozen mid-save: Switch isLoading +
 *   isDisabled with a "Saving…" Badge — the optimistic-update moment.
 * - Refresh restores the initial fixture state.
 *
 * Responsive contract:
 * - Column: contentWidth 1120 centers the stack; KPI Grid is 3-across and
 *   wraps to 1 column below ~840px; batch Cards sit 2-across and stack —
 *   at <=640px they force a single full-width column (the 420px track
 *   minimum would otherwise overflow a phone).
 * - Header: <=640px the Refresh and Open Sentry buttons collapse to
 *   icon-only; labels stay as accessible names and tooltips.
 * - Telemetry Card: internal 1.4fr/0.6fr grid (chart | count lists); at
 *   <=900px it stacks to a single column, chart first.
 * - Gate Table: <=900px hides the Risk and Query columns; at <=640px the
 *   Batch column folds into the Gate cell as a Token and Health narrows,
 *   so Gate, Health, and the Switch fit a phone without horizontal scroll.
 */

import {useState, type CSSProperties} from 'react';

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
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Card} from '@astryxdesign/core/Card';
import {Code} from '@astryxdesign/core/Code';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ExternalLinkIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from 'lucide-react';

// ============= STYLES =============

const CHART_HEIGHT = 148;

const styles: Record<string, CSSProperties> = {
  // Telemetry card interior: chart column is ~2.3x the count-list column.
  telemetryGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 0.6fr)',
    gap: 'var(--spacing-4)',
  },
  telemetryGridStacked: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: 'var(--spacing-4)',
  },
  // 24 hourly bars, baseline-aligned; pure divs, no chart dependency.
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 3,
    height: CHART_HEIGHT,
  },
  chartBarCell: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-end',
    height: '100%',
  },
  chartBar: {
    width: '100%',
    borderRadius: '2px 2px 0 0',
    backgroundColor: 'var(--color-icon-green)',
  },
  chartBarQuiet: {opacity: 0.45},
  // Thin proportional bar under each ranked-count row.
  countTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  countFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: 'var(--color-icon-green)',
  },
  kpiBar: {maxWidth: 220},
  tokenWrap: {flexWrap: 'wrap'},
  queryCell: {minWidth: 0},
};

// ============= DATA =============
// Deterministic fixtures: fixed timestamps and counts, no clocks, no
// randomness, no network assets.

const UPDATED_AT = '6/30/2026 2:14 PM';
const UPDATED_BY = 'djp@acme.dev';

type BatchId = 'batch-1' | 'batch-2';

// What the gate saw in the last 24h window. Health is derived from this
// plus the enabled bit — see healthOf().
type Telemetry =
  | {kind: 'events'; count: number} // firing normally
  | {kind: 'low'; count: number} // traffic below the alert floor
  | {kind: 'suppressed'; count: number} // bug still firing behind an off gate
  | {kind: 'none'}; // no metrics reported

interface Gate extends Record<string, unknown> {
  id: string;
  name: string;
  batch?: BatchId;
  enabled: boolean;
  isSaving?: boolean; // optimistic toggle in flight; Switch locked
  telemetry: Telemetry;
  risk: string;
  note?: string; // extra signal caption for Off gates
}

const BATCHES: Array<{id: BatchId; label: string; description: string}> = [
  {
    id: 'batch-1',
    label: 'Batch 1 — Streaming fixes May',
    description: 'Token-stream reliability fixes shipped behind gates in May.',
  },
  {
    id: 'batch-2',
    label: 'Batch 2 — Feedback fixes June',
    description: 'Feedback and mention handling fixes from the June push.',
  },
];

const BATCH_TOKEN: Record<BatchId, {short: string; color: 'blue' | 'purple'}> =
  {
    'batch-1': {short: 'batch 1', color: 'blue'},
    'batch-2': {short: 'batch 2', color: 'purple'},
  };

// 14 gates, 11 enabled. Rows exercise all five health states.
const INITIAL_GATES: Gate[] = [
  // --- Batch 1 — Streaming fixes May (5/5 enabled) ---
  {
    id: 'g-01',
    name: 'fix_tool_retry_loop',
    batch: 'batch-1',
    enabled: true,
    telemetry: {kind: 'events', count: 37},
    risk: 'Retries stalled tool calls; off restores the raw failure path.',
  },
  {
    id: 'g-02',
    name: 'fix_stream_abort',
    batch: 'batch-1',
    enabled: true,
    telemetry: {kind: 'none'},
    risk: 'Cleans up aborted streams; regression risk is orphaned readers.',
  },
  {
    id: 'g-03',
    name: 'fix_sse_reconnect',
    batch: 'batch-1',
    enabled: true,
    telemetry: {kind: 'events', count: 18},
    risk: 'Resumes dropped SSE sessions; off means silent mid-reply stalls.',
  },
  {
    id: 'g-04',
    name: 'fix_partial_json',
    batch: 'batch-1',
    enabled: true,
    telemetry: {kind: 'events', count: 9},
    risk: 'Repairs truncated tool JSON; off surfaces parse errors to users.',
  },
  {
    id: 'g-05',
    name: 'fix_stream_dedupe',
    batch: 'batch-1',
    enabled: true,
    telemetry: {kind: 'low', count: 2},
    risk: 'Drops duplicate chunks; traffic is thin, watch before relying.',
  },
  // --- Batch 2 — Feedback fixes June (3/5 enabled) ---
  {
    id: 'g-06',
    name: 'fix_compaction_dupe',
    batch: 'batch-2',
    enabled: false,
    telemetry: {kind: 'suppressed', count: 12},
    risk: 'Dedupes compacted turns; suppression means the bug still fires.',
  },
  {
    id: 'g-07',
    name: 'fix_gchat_mentions',
    batch: 'batch-2',
    enabled: true,
    telemetry: {kind: 'events', count: 8},
    risk: 'Rewrites bare @mentions; off breaks pings in threaded rooms.',
  },
  {
    id: 'g-08',
    name: 'fix_feedback_race',
    batch: 'batch-2',
    enabled: false,
    telemetry: {kind: 'events', count: 0},
    risk: 'Serializes thumb writes; held off pending the store migration.',
    note: 'Disabled 6/28',
  },
  {
    id: 'g-09',
    name: 'fix_thumb_double',
    batch: 'batch-2',
    enabled: true,
    telemetry: {kind: 'events', count: 5},
    risk: 'Debounces double thumb taps; off double-counts feedback.',
  },
  {
    id: 'g-10',
    name: 'fix_emoji_strip',
    batch: 'batch-2',
    enabled: true,
    isSaving: true,
    telemetry: {kind: 'events', count: 3},
    risk: 'Strips unsupported emoji before send; toggle is mid-save.',
  },
  // --- Unbatched strays ---
  {
    id: 'g-11',
    name: 'fix_token_meter',
    enabled: true,
    telemetry: {kind: 'events', count: 11},
    risk: 'Corrects context-meter drift; off shows stale percentages.',
  },
  {
    id: 'g-12',
    name: 'fix_scroll_anchor',
    enabled: true,
    telemetry: {kind: 'low', count: 1},
    risk: 'Pins scroll during streaming; one event all day — near-dead path.',
  },
  {
    id: 'g-13',
    name: 'fix_lang_detect',
    enabled: true,
    telemetry: {kind: 'none'},
    risk: 'Re-detects reply language; emits no telemetry until v2 lands.',
  },
  {
    id: 'g-14',
    name: 'fix_legacy_paste',
    enabled: false,
    telemetry: {kind: 'events', count: 0},
    risk: 'Old rich-paste shim; superseded, kept only as a rollback path.',
    note: 'Disabled 5/12',
  },
];

const GATE_COUNT = INITIAL_GATES.length;

// 24 fixed hourly gate-event counts (00:00 → 23:00), peaking at 41 during
// the 09:00 bucket. Sums to 219 — the same "219 in window" the Telemetry
// Window KPI and the By-event list (204 + 12 + 3) report.
const HOURLY_EVENTS = [
  3, 2, 2, 1, 1, 2, 4, 7, 14, 41, 24, 16, 13, 11, 10, 9, 11, 12, 10, 8, 6, 5,
  4, 3,
];
const HOURLY_MAX = 41;

const SENTRY_QUERY =
  'event.type:[gate_evaluated,gate_suppressed] tags[service]:navi';

interface RankedCount {
  label: string;
  count: number;
}

const COUNTS_BY_GATE: RankedCount[] = [
  {label: 'fix_tool_retry_loop', count: 37},
  {label: 'fix_compaction_dupe', count: 12},
  {label: 'fix_gchat_mentions', count: 8},
];

const COUNTS_BY_EVENT: RankedCount[] = [
  {label: 'gate_evaluated', count: 204},
  {label: 'gate_suppressed', count: 12},
  {label: 'admin_update', count: 3},
];

const COUNTS_SUPPRESSED: RankedCount[] = [
  {label: 'fix_compaction_dupe', count: 12},
];

// ============= HEALTH VOCABULARY =============
// Exactly five states: Healthy emerald, Warning amber, Suppressing amber,
// Off muted, No signal muted.

type Health = 'healthy' | 'warning' | 'suppressing' | 'off' | 'nosignal';

const HEALTH: Record<
  Health,
  {label: string; dot: 'success' | 'warning' | 'neutral'}
> = {
  healthy: {label: 'Healthy', dot: 'success'},
  warning: {label: 'Warning', dot: 'warning'},
  suppressing: {label: 'Suppressing', dot: 'warning'},
  off: {label: 'Off', dot: 'neutral'},
  nosignal: {label: 'No signal', dot: 'neutral'},
};

/** Derive health so Switch flips move the dot coherently. */
function healthOf(gate: Gate): Health {
  if (gate.telemetry.kind === 'none') {
    return 'nosignal';
  }
  if (!gate.enabled) {
    return gate.telemetry.kind === 'suppressed' && gate.telemetry.count > 0
      ? 'suppressing'
      : 'off';
  }
  if (gate.telemetry.kind === 'low') {
    return 'warning';
  }
  // An enabled gate still counting suppressions has a mixed window.
  if (gate.telemetry.kind === 'suppressed') {
    return 'warning';
  }
  return 'healthy';
}

function signalOf(gate: Gate): string {
  switch (gate.telemetry.kind) {
    case 'none':
      return 'Metrics unavailable';
    case 'suppressed':
      return `${gate.telemetry.count} suppressed / 24h`;
    case 'low':
      return `${gate.telemetry.count} events / 24h · below floor`;
    case 'events':
      if (!gate.enabled) {
        return gate.note ?? 'Gate off · 0 events / 24h';
      }
      return `${gate.telemetry.count} events / 24h`;
  }
}

function queryOf(gate: Gate): string {
  return `tags[gate]:${gate.name}`;
}

// ============= TELEMETRY BITS =============

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/** 24 emerald div bars; quiet hours (<25% of peak) render dimmed. */
function HourlyBarChart() {
  return (
    <div
      style={styles.chart}
      role="img"
      aria-label="Hourly gate events over the last 24 hours, peaking at 41 events in the 09:00 bucket">
      {HOURLY_EVENTS.map((count, hour) => (
        <div key={hour} style={styles.chartBarCell}>
          <Tooltip content={`${hourLabel(hour)} — ${count} events`}>
            <div
              style={{
                ...styles.chartBar,
                ...(count < HOURLY_MAX * 0.25 ? styles.chartBarQuiet : {}),
                height: Math.max(
                  4,
                  Math.round((count / HOURLY_MAX) * CHART_HEIGHT),
                ),
              }}
              aria-hidden
            />
          </Tooltip>
        </div>
      ))}
    </div>
  );
}

/** Ranked count list: mono label, tabular count, thin proportional bar. */
function CountList({
  title,
  items,
  footer,
}: {
  title: string;
  items: RankedCount[];
  footer?: string;
}) {
  const max = Math.max(...items.map(item => item.count));
  return (
    <Card variant="muted" padding={3}>
      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary">
          {title}
        </Text>
        {items.map(item => (
          <VStack key={item.label} gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="code" size="sm" maxLines={1}>
                  {item.label}
                </Text>
              </StackItem>
              <Text type="supporting" hasTabularNumbers>
                {item.count}
              </Text>
            </HStack>
            <div style={styles.countTrack} aria-hidden>
              <div
                style={{
                  ...styles.countFill,
                  width: `${Math.round((item.count / max) * 100)}%`,
                }}
              />
            </div>
          </VStack>
        ))}
        {footer != null && (
          <Text type="supporting" size="sm" color="secondary">
            {footer}
          </Text>
        )}
      </VStack>
    </Card>
  );
}

// ============= BATCH CARD =============

function BatchCard({
  batch,
  gates,
  onSetBatch,
}: {
  batch: {id: BatchId; label: string; description: string};
  gates: Gate[];
  onSetBatch: (batch: BatchId, enabled: boolean) => void;
}) {
  const members = gates.filter(gate => gate.batch === batch.id);
  const enabledCount = members.filter(gate => gate.enabled).length;
  const allOn = enabledCount === members.length;
  const allOff = enabledCount === 0;

  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3}>{batch.label}</Heading>
          </StackItem>
          <Badge
            variant={allOn ? 'success' : 'neutral'}
            label={`${enabledCount}/${members.length} enabled`}
          />
        </HStack>
        <Text type="supporting" color="secondary">
          {batch.description}
        </Text>
        <ProgressBar
          value={enabledCount}
          max={members.length}
          label={`${batch.label}: ${enabledCount} of ${members.length} gates enabled`}
          isLabelHidden
          variant="success"
        />
        <HStack gap={1} style={styles.tokenWrap}>
          {members.map(gate => (
            <Token
              key={gate.id}
              label={gate.name}
              size="sm"
              color={gate.enabled ? 'green' : 'gray'}
            />
          ))}
        </HStack>
        <Divider />
        <HStack gap={2}>
          <Button
            label="Enable this batch"
            variant="secondary"
            size="sm"
            isDisabled={allOn}
            onClick={() => onSetBatch(batch.id, true)}
          />
          <Button
            label="Disable this batch"
            variant="ghost"
            size="sm"
            isDisabled={allOff}
            onClick={() => onSetBatch(batch.id, false)}
          />
        </HStack>
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

export default function FeatureGateConsoleTemplate() {
  const [gates, setGates] = useState<Gate[]>(INITIAL_GATES);

  // <=900px: telemetry grid stacks and the Risk/Query columns hide.
  const isCompact = useMediaQuery('(max-width: 900px)');
  // <=640px: header buttons go icon-only, batch Cards force one full-width
  // column, and the table folds Batch into the Gate cell so the Switch
  // column stays on-screen without horizontal scroll.
  const isMobile = useMediaQuery('(max-width: 640px)');

  const enabledCount = gates.filter(gate => gate.enabled).length;

  const toggleGate = (id: string, enabled: boolean) => {
    setGates(prev =>
      prev.map(gate => (gate.id === id ? {...gate, enabled} : gate)),
    );
  };

  // Batch actions skip the row that is frozen mid-save.
  const setBatch = (batch: BatchId, enabled: boolean) => {
    setGates(prev =>
      prev.map(gate =>
        gate.batch === batch && gate.isSaving !== true
          ? {...gate, enabled}
          : gate,
      ),
    );
  };

  const refresh = () => {
    setGates(INITIAL_GATES.map(gate => ({...gate})));
  };

  const healthCell = (gate: Gate) => {
    const health = healthOf(gate);
    return (
      <HStack gap={2} vAlign="center">
        <StatusDot
          variant={HEALTH[health].dot}
          label={`${HEALTH[health].label}: ${gate.name}`}
        />
        <VStack gap={0}>
          <Text size="sm">{HEALTH[health].label}</Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {signalOf(gate)}
          </Text>
        </VStack>
      </HStack>
    );
  };

  return (
    <Layout
      height="fill"
      contentWidth={1120}
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <Icon icon={ShieldCheckIcon} size="md" color="secondary" />
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Gates</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {enabledCount} of {GATE_COUNT} gates enabled
                </Text>
              </HStack>
            </StackItem>
            <ButtonGroup label="Gate console actions" size="sm">
              <Button
                label="Refresh"
                variant="secondary"
                size="sm"
                isIconOnly={isMobile}
                tooltip={isMobile ? 'Refresh' : undefined}
                icon={<Icon icon={RefreshCwIcon} size="sm" color="inherit" />}
                onClick={refresh}
              />
              <Button
                label="Open Sentry"
                variant="secondary"
                size="sm"
                isIconOnly={isMobile}
                tooltip={isMobile ? 'Open Sentry' : undefined}
                icon={
                  <Icon icon={ExternalLinkIcon} size="sm" color="inherit" />
                }
                onClick={() => {}}
              />
            </ButtonGroup>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={4}>
            <Text type="supporting" color="secondary">
              Every gated fix ships dark behind a runtime kill switch. Flip a
              gate off and the fix stops applying within one poll interval —
              no deploy, no restart. Telemetry below is the last 24 hours of
              Sentry gate events.
            </Text>

            {/* KPI row: 3 across, stacks on mobile. */}
            <Grid columns={{minWidth: 260, max: 3}} gap={3}>
              <Card padding={4}>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Gate State
                  </Text>
                  <Heading level={2}>
                    {enabledCount}/{GATE_COUNT} enabled
                  </Heading>
                  <div style={styles.kpiBar}>
                    <ProgressBar
                      value={enabledCount}
                      max={GATE_COUNT}
                      label="Share of gates enabled"
                      isLabelHidden
                      variant="success"
                    />
                  </div>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {GATE_COUNT - enabledCount} gates dark
                  </Text>
                </VStack>
              </Card>
              <Card padding={4}>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Last Changed
                  </Text>
                  <Heading level={2}>{UPDATED_AT}</Heading>
                  <Text type="supporting" color="secondary">
                    by <Code>{UPDATED_BY}</Code> · admin_update
                  </Text>
                </VStack>
              </Card>
              <Card padding={4}>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Telemetry Window
                  </Text>
                  <Heading level={2}>Last 24h · 1h buckets</Heading>
                  <MetadataList label={{position: 'start', width: 64}}>
                    <MetadataListItem label="Source">
                      Sentry gate events
                    </MetadataListItem>
                    <MetadataListItem label="Events">
                      219 in window
                    </MetadataListItem>
                  </MetadataList>
                </VStack>
              </Card>
            </Grid>

            {/* Rollout batches: enable/disable a whole wave at once. The
                420px track minimum overflows a phone, so <=640px pins a
                single full-width column instead. */}
            <Grid
              columns={isMobile ? 1 : {minWidth: 420, max: 2}}
              gap={3}>
              {BATCHES.map(batch => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  gates={gates}
                  onSetBatch={setBatch}
                />
              ))}
            </Grid>

            <Banner
              status="warning"
              title="Telemetry degraded — metrics may lag"
              description="Sentry ingest is running ~22 minutes behind; the newest hourly bucket may under-report."
              isDismissable
            />

            {/* Telemetry: emerald bar chart + ranked count lists. */}
            <Card padding={4}>
              <VStack gap={3}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <Heading level={3}>Gate telemetry</Heading>
                  </StackItem>
                  <Badge variant="neutral" label="Last 24h" />
                  <IconButton
                    label="Open this query in Sentry"
                    tooltip="Open in Sentry"
                    icon={
                      <Icon
                        icon={ExternalLinkIcon}
                        size="sm"
                        color="inherit"
                      />
                    }
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                  />
                </HStack>
                <div
                  style={
                    isCompact ? styles.telemetryGridStacked : styles.telemetryGrid
                  }>
                  <VStack gap={2}>
                    <HourlyBarChart />
                    <HStack gap={2} vAlign="center" hAlign="between">
                      {[0, 6, 12, 18, 23].map(hour => (
                        <Text
                          key={hour}
                          type="supporting"
                          size="sm"
                          color="secondary"
                          hasTabularNumbers>
                          {hourLabel(hour)}
                        </Text>
                      ))}
                    </HStack>
                    <Divider />
                    <Text type="supporting" color="secondary">
                      Query: <Code>{SENTRY_QUERY}</Code>
                    </Text>
                  </VStack>
                  <VStack gap={2}>
                    <CountList title="By gate" items={COUNTS_BY_GATE} />
                    <CountList title="By event" items={COUNTS_BY_EVENT} />
                    <CountList
                      title="Suppressed"
                      items={COUNTS_SUPPRESSED}
                      footer="No other gates suppressed events."
                    />
                  </VStack>
                </div>
              </VStack>
            </Card>

            {/* Master gate table: one row per kill switch. */}
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Heading level={3}>All gates</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {GATE_COUNT} gates · {enabledCount} enabled
                </Text>
              </HStack>
              <Table
                data={gates}
                idKey="id"
                density="compact"
                hasHover
                textOverflow="truncate"
                columns={[
                  {
                    key: 'name',
                    header: 'Gate',
                    width: proportional(1.2),
                    renderCell: gate => (
                      <VStack gap={1}>
                        <Text type="code" size="sm" maxLines={1}>
                          {gate.name}
                        </Text>
                        <HStack
                          gap={1}
                          vAlign="center"
                          style={styles.tokenWrap}>
                          {gate.isSaving === true ? (
                            <Badge variant="warning" label="Saving…" />
                          ) : (
                            <Badge
                              variant={gate.enabled ? 'success' : 'neutral'}
                              label={gate.enabled ? 'Enabled' : 'Disabled'}
                            />
                          )}
                          {/* <=640px: the Batch column is hidden, so the
                              batch Token folds in here. */}
                          {isMobile && gate.batch != null && (
                            <Token
                              label={BATCH_TOKEN[gate.batch].short}
                              size="sm"
                              color={BATCH_TOKEN[gate.batch].color}
                            />
                          )}
                        </HStack>
                      </VStack>
                    ),
                  },
                  {
                    key: 'health',
                    header: 'Health',
                    width: isMobile ? pixel(150) : pixel(190),
                    renderCell: healthCell,
                  },
                  ...(isMobile
                    ? []
                    : [
                        {
                          key: 'batch',
                          header: 'Batch',
                          width: pixel(100),
                          renderCell: (gate: Gate) =>
                            gate.batch != null ? (
                              <Token
                                label={BATCH_TOKEN[gate.batch].short}
                                size="sm"
                                color={BATCH_TOKEN[gate.batch].color}
                              />
                            ) : (
                              <Text type="supporting" color="secondary">
                                —
                              </Text>
                            ),
                        },
                      ]),
                  ...(isCompact
                    ? []
                    : [
                        {
                          key: 'risk',
                          header: 'Risk',
                          width: proportional(1.5),
                          renderCell: (gate: Gate) => (
                            <Text type="supporting" color="secondary">
                              {gate.risk}
                            </Text>
                          ),
                        },
                        {
                          key: 'query',
                          header: 'Sentry query',
                          width: proportional(1),
                          renderCell: (gate: Gate) => (
                            <div style={styles.queryCell}>
                              <Link
                                href="#"
                                type="code"
                                size="sm"
                                maxLines={1}
                                tooltip="Open gate events in Sentry">
                                {queryOf(gate)}
                              </Link>
                            </div>
                          ),
                        },
                      ]),
                  {
                    key: 'enabled',
                    header: '',
                    width: pixel(72),
                    align: 'end',
                    resizable: false,
                    renderCell: gate => (
                      <Switch
                        label={
                          gate.enabled
                            ? `Disable ${gate.name}`
                            : `Enable ${gate.name}`
                        }
                        isLabelHidden
                        value={gate.enabled}
                        onChange={checked => toggleGate(gate.id, checked)}
                        isLoading={gate.isSaving === true}
                        isDisabled={gate.isSaving === true}
                      />
                    ),
                  },
                ]}
              />
              <Text type="supporting" size="sm" color="secondary">
                Toggles apply optimistically and propagate to clients within
                one 60s poll. Suppressing means the underlying bug is still
                firing behind an off gate — usually the strongest signal to
                re-enable.
              </Text>
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
