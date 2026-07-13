var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (event subscriptions with patterns,
 *   channels, and per-row enabled state; a 12-row dispatch history with
 *   fixed ISO timestamps, durations, and one captured webhook error body;
 *   four headline stats)
 * @output Server-events dashboard for an agent workspace: a centered glassy
 *   floating pill navbar (Chat / Events / Status round icon buttons, active
 *   ring on Events); four stat blocks with 2xl tabular numbers, left-border
 *   dividers, and tone-coded Badges; a SUBSCRIPTIONS table (mono event
 *   pattern, channel Badge, target session, enabled Switch, last-dispatch
 *   relative time, StatusDot); a DISPATCH HISTORY list where failed rows
 *   expand (Collapsible) into an error CodeBlock; and a dashed-border
 *   empty-state specimen panel for a workspace with no subscriptions
 * @position Page template; emitted by \`astryx template agent-events-dashboard\`
 *
 * Frame: Layout height="fill", no LayoutHeader — the floating pill navbar
 * is the chrome. LayoutContent scrolls; the navbar is position: sticky at
 * the top of the scroll and stays centered over the content. The dashboard
 * body is a centered ~960px column of stacked Sections.
 *
 * Responsive contract (useElementWidth on the page wrapper — viewport
 * media queries never fire in the inline demo stage):
 * - Stat blocks: Grid columns={{minWidth: 200, max: 4}} — 4-up wide,
 *   reflowing to 2x2 and then 1-up as the page narrows.
 * - >720px: subscriptions table shows all six columns; dispatch rows show
 *   the duration column.
 * - <=720px: the table drops the Target session and Last dispatch columns
 *   (status dot and Switch survive — they are the actionable pair);
 *   dispatch rows drop duration and keep the result Badge + Timestamp.
 */

import {useRef, useState, useEffect} from 'react';
import type {CSSProperties, RefObject} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {
  ActivityIcon,
  InboxIcon,
  MessageSquareIcon,
  PlusIcon,
  ZapIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  pageWrap: {height: '100%'},
  // Sticky rail keeps the pill centered over the scrolling dashboard.
  navRail: {
    position: 'sticky',
    top: 'var(--spacing-3)',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    paddingInline: 'var(--spacing-4)',
  },
  // Glassy floating pill approximated with tokens: card surface, hairline
  // border, soft shadow — no backdrop-filter needed.
  navPill: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-high)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  navButton: {borderRadius: 'var(--radius-full)'},
  navButtonActive: {
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-accent-muted)',
    boxShadow: '0 0 0 1.5px var(--color-accent)',
  },
  column: {
    maxWidth: 960,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-8)',
    // Pull the header up beside the sticky rail's reserved line.
    paddingTop: 'var(--spacing-4)',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  // Stat blocks: quote-bar left border is the divider motif.
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
  monoCell: {fontFamily: 'var(--font-family-code)', fontSize: 12},
  dispatchEvent: {width: 196, flexShrink: 0, minWidth: 0},
  dispatchPayload: {minWidth: 0},
  dispatchDuration: {width: 56, textAlign: 'right', flexShrink: 0},
  dispatchRow: {paddingBlock: 'var(--spacing-2)'},
  errorBlock: {paddingBlock: 'var(--spacing-2)'},
  // Dashed specimen panel for the no-subscriptions state.
  emptyPanel: {
    border: '1.5px dashed var(--color-border-emphasized)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-6)',
    backgroundColor: 'var(--color-background-muted)',
  },
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
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const WORKSPACE_LABEL = 'Atlas Engineering · #atlas-eng';
const AGENT_NAME = 'Pipeline Copilot';

const NAV_ITEMS: ReadonlyArray<{
  id: 'chat' | 'events' | 'status';
  label: string;
  icon: typeof ZapIcon;
}> = [
  {id: 'chat', label: 'Chat', icon: MessageSquareIcon},
  {id: 'events', label: 'Events', icon: ZapIcon},
  {id: 'status', label: 'Status', icon: ActivityIcon},
];

const ACTIVE_NAV = 'events';

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

const STATS: ReadonlyArray<{
  id: string;
  label: string;
  value: string;
  badge: {label: string; variant: BadgeTone};
}> = [
  {
    id: 'subs',
    label: 'Subscriptions',
    value: '12',
    badge: {label: '+2 this week', variant: 'info'},
  },
  {
    id: 'dispatches',
    label: 'Dispatches (24h)',
    value: '482',
    badge: {label: '99.4% delivered', variant: 'success'},
  },
  {
    id: 'failures',
    label: 'Failures',
    value: '3',
    badge: {label: '1 in dead-letter', variant: 'error'},
  },
  {
    id: 'latency',
    label: 'P95 latency',
    value: '840ms',
    badge: {label: '+120ms vs 7d', variant: 'warning'},
  },
];

type DotVariant = 'success' | 'warning' | 'error' | 'accent' | 'neutral';

interface Subscription {
  id: string;
  pattern: string;
  channel: {label: string; variant: BadgeTone};
  target: string;
  lastDispatch: string; // static relative label — no clocks
  status: {variant: DotVariant; label: string};
  isEnabled: boolean;
}

const SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    pattern: 'session.completed',
    channel: {label: 'TeamChat', variant: 'info'},
    target: 'deploy-triage',
    lastDispatch: '4m ago',
    status: {variant: 'success', label: 'Healthy'},
    isEnabled: true,
  },
  {
    id: 'sub-2',
    pattern: 'tool.bash.failed',
    channel: {label: 'TeamChat', variant: 'info'},
    target: 'perf-triage',
    lastDispatch: '12m ago',
    status: {variant: 'success', label: 'Healthy'},
    isEnabled: true,
  },
  {
    id: 'sub-3',
    pattern: 'tool.*.failed',
    channel: {label: 'Webhook', variant: 'neutral'},
    target: 'Whole workspace',
    lastDispatch: '26m ago',
    status: {variant: 'error', label: 'Failing — endpoint 503'},
    isEnabled: true,
  },
  {
    id: 'sub-4',
    pattern: 'schedule.run.finished',
    channel: {label: 'Webhook', variant: 'neutral'},
    target: 'nightly-digest',
    lastDispatch: '1h ago',
    status: {variant: 'success', label: 'Healthy'},
    isEnabled: true,
  },
  {
    id: 'sub-5',
    pattern: 'node.disconnected',
    channel: {label: 'Push', variant: 'success'},
    target: 'Any session',
    lastDispatch: '3h ago',
    status: {variant: 'warning', label: 'Retrying'},
    isEnabled: true,
  },
  {
    id: 'sub-6',
    pattern: 'session.needs_review',
    channel: {label: 'Email', variant: 'warning'},
    target: 'inbox-sweeper',
    lastDispatch: '5h ago',
    status: {variant: 'success', label: 'Healthy'},
    isEnabled: true,
  },
  {
    id: 'sub-7',
    pattern: 'memory.compacted',
    channel: {label: 'TeamChat', variant: 'info'},
    target: 'long-context-lab',
    lastDispatch: 'Yesterday',
    status: {variant: 'neutral', label: 'Paused'},
    isEnabled: false,
  },
  {
    id: 'sub-8',
    pattern: 'agent.handoff.*',
    channel: {label: 'Push', variant: 'success'},
    target: 'support-rotation',
    lastDispatch: '2d ago',
    status: {variant: 'success', label: 'Healthy'},
    isEnabled: true,
  },
];

type DispatchResult = 'delivered' | 'retried' | 'failed';

const RESULT_BADGE: Record<DispatchResult, {label: string; variant: BadgeTone}> =
  {
    delivered: {label: 'delivered', variant: 'success'},
    retried: {label: 'retried', variant: 'warning'},
    failed: {label: 'failed', variant: 'error'},
  };

interface Dispatch {
  id: string;
  event: string;
  payload: string;
  result: DispatchResult;
  duration: string;
  at: string; // fixed ISO timestamp
  error?: string;
}

const DISPATCHES: Dispatch[] = [
  {
    id: 'd-1',
    event: 'session.completed',
    payload: '{"session":"deploy-triage","status":"done","turns":18}',
    result: 'delivered',
    duration: '84ms',
    at: '2026-07-13T09:41:12',
  },
  {
    id: 'd-2',
    event: 'tool.bash.failed',
    payload: '{"session":"perf-triage","tool":"bash","exit_code":137}',
    result: 'delivered',
    duration: '96ms',
    at: '2026-07-13T09:33:07',
  },
  {
    id: 'd-3',
    event: 'tool.web.failed',
    payload: '{"session":"docs-crawler","tool":"web","error":"timeout"}',
    result: 'failed',
    duration: '30.4s',
    at: '2026-07-13T09:19:44',
    error: \`POST https://hooks.opsrelay.example/v1/ingest
-> 503 Service Unavailable (attempt 3 of 3)
{"error":"upstream_timeout","retry_after_s":120}
gave up after 3 attempts - routed to dead-letter queue (dlq:atlas-eng)\`,
  },
  {
    id: 'd-4',
    event: 'node.disconnected',
    payload: '{"node":"cli:mac-studio","last_seen":"09:02:51","ttl_s":1200}',
    result: 'retried',
    duration: '2.1s',
    at: '2026-07-13T09:04:18',
  },
  {
    id: 'd-5',
    event: 'session.completed',
    payload: '{"session":"inbox-sweeper","status":"done","turns":6}',
    result: 'delivered',
    duration: '71ms',
    at: '2026-07-13T08:47:29',
  },
  {
    id: 'd-6',
    event: 'schedule.run.finished',
    payload: '{"schedule":"nightly-digest","runtime_s":312,"ok":true}',
    result: 'delivered',
    duration: '104ms',
    at: '2026-07-13T07:00:41',
  },
  {
    id: 'd-7',
    event: 'session.needs_review',
    payload: '{"session":"quota-audit","reason":"plan_confirmation"}',
    result: 'delivered',
    duration: '88ms',
    at: '2026-07-13T06:52:10',
  },
  {
    id: 'd-8',
    event: 'tool.*.failed',
    payload: '{"session":"release-notes","tool":"ipython","error":"oom"}',
    result: 'failed',
    duration: '30.2s',
    at: '2026-07-13T05:38:56',
    error: \`POST https://hooks.opsrelay.example/v1/ingest
-> 503 Service Unavailable (attempt 3 of 3)
{"error":"upstream_timeout","retry_after_s":120}
gave up after 3 attempts - routed to dead-letter queue (dlq:atlas-eng)\`,
  },
  {
    id: 'd-9',
    event: 'agent.handoff.accepted',
    payload: '{"from":"support-rotation","to":"escalations","ticket":4821}',
    result: 'delivered',
    duration: '92ms',
    at: '2026-07-13T04:26:33',
  },
  {
    id: 'd-10',
    event: 'node.disconnected',
    payload: '{"node":"browser:chrome-work","last_seen":"03:58:02"}',
    result: 'retried',
    duration: '1.8s',
    at: '2026-07-13T03:59:47',
  },
  {
    id: 'd-11',
    event: 'session.completed',
    payload: '{"session":"nightly-digest","status":"done","turns":22}',
    result: 'delivered',
    duration: '79ms',
    at: '2026-07-13T02:11:05',
  },
  {
    id: 'd-12',
    event: 'memory.compacted',
    payload: '{"session":"long-context-lab","removed_tokens":45000}',
    result: 'delivered',
    duration: '66ms',
    at: '2026-07-12T23:48:19',
  },
];

// ============= DISPATCH ROW =============

function DispatchRowContent({
  dispatch,
  isCompact,
}: {
  dispatch: Dispatch;
  isCompact: boolean;
}) {
  const badge = RESULT_BADGE[dispatch.result];
  return (
    <HStack gap={3} vAlign="center">
      <div style={styles.dispatchEvent}>
        <Text type="code" size="sm" maxLines={1}>
          {dispatch.event}
        </Text>
      </div>
      <StackItem size="fill" style={styles.dispatchPayload}>
        <Text type="code" size="sm" color="secondary" maxLines={1}>
          {dispatch.payload}
        </Text>
      </StackItem>
      <Badge label={badge.label} variant={badge.variant} />
      {!isCompact && (
        <div style={styles.dispatchDuration}>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {dispatch.duration}
          </Text>
        </div>
      )}
      <Timestamp
        value={dispatch.at}
        format="time"
        type="supporting"
        color="secondary"
      />
    </HStack>
  );
}

function DispatchRow({
  dispatch,
  isCompact,
  defaultIsOpen = false,
}: {
  dispatch: Dispatch;
  isCompact: boolean;
  defaultIsOpen?: boolean;
}) {
  // Failed rows expand into the captured delivery error; everything else
  // is a flat row.
  if (dispatch.error == null) {
    return (
      <div style={styles.dispatchRow}>
        <DispatchRowContent dispatch={dispatch} isCompact={isCompact} />
      </div>
    );
  }
  return (
    <div style={styles.dispatchRow}>
      <Collapsible
        defaultIsOpen={defaultIsOpen}
        trigger={
          <DispatchRowContent dispatch={dispatch} isCompact={isCompact} />
        }>
        <div style={styles.errorBlock}>
          <CodeBlock
            code={dispatch.error}
            language="bash"
            title="delivery error"
            size="sm"
            width="100%"
            hasCopyButton={false}
            isWrapped
          />
        </div>
      </Collapsible>
    </div>
  );
}

// ============= PAGE =============

export default function AgentEventsDashboardTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;

  // Per-row enabled state for the subscriptions table.
  const [enabledIds, setEnabledIds] = useState<ReadonlySet<string>>(
    () =>
      new Set(SUBSCRIPTIONS.filter(sub => sub.isEnabled).map(sub => sub.id)),
  );

  const toggleSubscription = (id: string, checked: boolean) => {
    setEnabledIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const firstFailedId = DISPATCHES.find(item => item.result === 'failed')?.id;

  return (
    <div ref={wrapRef} style={styles.pageWrap}>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0}>
            {/* Glassy floating pill navbar — Chat / Events / Status. */}
            <div style={styles.navRail}>
              <nav style={styles.navPill} aria-label="Agent surfaces">
                {NAV_ITEMS.map(item => {
                  const isActive = item.id === ACTIVE_NAV;
                  return (
                    <IconButton
                      key={item.id}
                      label={item.label}
                      tooltip={item.label}
                      icon={
                        <Icon icon={item.icon} size="sm" color="inherit" />
                      }
                      variant="ghost"
                      size="md"
                      aria-current={isActive ? 'page' : undefined}
                      style={
                        isActive ? styles.navButtonActive : styles.navButton
                      }
                      // Chat and Status navigate away from this surface.
                      onClick={() => {}}
                    />
                  );
                })}
              </nav>
            </div>

            <div style={styles.column}>
              <VStack gap={6}>
                {/* Header */}
                <HStack gap={3} vAlign="center">
                  <StackItem size="fill">
                    <VStack gap={1}>
                      <span style={styles.eyebrow}>Server events</span>
                      <HStack gap={2} vAlign="center">
                        <Heading level={1}>Event routing</Heading>
                        <StatusDot
                          variant="accent"
                          label="Live — receiving events"
                          isPulsing
                        />
                      </HStack>
                      <Text type="supporting" color="secondary">
                        {WORKSPACE_LABEL} · dispatched by {AGENT_NAME}
                      </Text>
                    </VStack>
                  </StackItem>
                  <Button
                    label="New subscription"
                    size="sm"
                    icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
                    onClick={() => {}}
                  />
                </HStack>

                {/* Stat blocks: left-border dividers, 2xl tabular numbers. */}
                <Grid columns={{minWidth: 200, max: 4}} gap={4}>
                  {STATS.map(stat => (
                    <div key={stat.id} style={styles.statBlock}>
                      <VStack gap={1}>
                        <Text type="supporting" color="secondary">
                          {stat.label}
                        </Text>
                        <span style={styles.statValue}>{stat.value}</span>
                        <HStack gap={1}>
                          <Badge
                            label={stat.badge.label}
                            variant={stat.badge.variant}
                          />
                        </HStack>
                      </VStack>
                    </div>
                  ))}
                </Grid>

                {/* Subscriptions */}
                <VStack gap={2}>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <span style={styles.eyebrow}>Subscriptions</span>
                    </StackItem>
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      8 of 12 · sorted by last dispatch
                    </Text>
                  </HStack>
                  <Card padding={0}>
                    <Table density="compact" dividers="rows" hasHover>
                      <TableHeader>
                        <TableRow isHeaderRow>
                          <TableHeaderCell scope="col">
                            Event pattern
                          </TableHeaderCell>
                          <TableHeaderCell
                            scope="col"
                            style={{width: 104, minWidth: 104}}>
                            Channel
                          </TableHeaderCell>
                          {!isCompact && (
                            <TableHeaderCell scope="col">
                              Target session
                            </TableHeaderCell>
                          )}
                          {!isCompact && (
                            <TableHeaderCell
                              scope="col"
                              style={{width: 112, minWidth: 112}}>
                              Last dispatch
                            </TableHeaderCell>
                          )}
                          <TableHeaderCell
                            scope="col"
                            style={{width: 72, minWidth: 72}}>
                            Status
                          </TableHeaderCell>
                          <TableHeaderCell
                            scope="col"
                            style={{width: 76, minWidth: 76}}>
                            Enabled
                          </TableHeaderCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {SUBSCRIPTIONS.map(sub => (
                          <TableRow key={sub.id}>
                            <TableCell>
                              <span style={styles.monoCell}>{sub.pattern}</span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                label={sub.channel.label}
                                variant={sub.channel.variant}
                              />
                            </TableCell>
                            {!isCompact && (
                              <TableCell>
                                <Text type="supporting" color="secondary">
                                  {sub.target}
                                </Text>
                              </TableCell>
                            )}
                            {!isCompact && (
                              <TableCell>
                                <Text
                                  type="supporting"
                                  color="secondary"
                                  hasTabularNumbers>
                                  {sub.lastDispatch}
                                </Text>
                              </TableCell>
                            )}
                            <TableCell>
                              <StatusDot
                                variant={sub.status.variant}
                                label={sub.status.label}
                                tooltip={sub.status.label}
                                isPulsing={sub.status.variant === 'warning'}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                label={\`Enable dispatches for \${sub.pattern}\`}
                                isLabelHidden
                                value={enabledIds.has(sub.id)}
                                onChange={checked =>
                                  toggleSubscription(sub.id, checked)
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </VStack>

                {/* Dispatch history */}
                <VStack gap={2}>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <span style={styles.eyebrow}>Dispatch history</span>
                    </StackItem>
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      Last 12 · retention 30 days
                    </Text>
                  </HStack>
                  <Card padding={3}>
                    <VStack gap={0}>
                      {DISPATCHES.map((dispatch, index) => (
                        <VStack key={dispatch.id} gap={0}>
                          <DispatchRow
                            dispatch={dispatch}
                            isCompact={isCompact}
                            defaultIsOpen={dispatch.id === firstFailedId}
                          />
                          {index < DISPATCHES.length - 1 && <Divider />}
                        </VStack>
                      ))}
                    </VStack>
                  </Card>
                </VStack>

                {/* Empty-state specimen: another scope with nothing wired up. */}
                <VStack gap={2}>
                  <span style={styles.eyebrow}>Personal workspace</span>
                  <div style={styles.emptyPanel}>
                    <EmptyState
                      icon={<Icon icon={InboxIcon} size="lg" color="secondary" />}
                      title="No subscriptions in this workspace yet"
                      description="Subscribe a session to server events and dispatches will show up here within seconds."
                      actions={
                        <Button
                          label="New subscription"
                          variant="secondary"
                          size="sm"
                          onClick={() => {}}
                        />
                      }
                      isCompact
                    />
                  </div>
                </VStack>
              </VStack>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};