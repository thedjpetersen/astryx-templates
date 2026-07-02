// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (sub-agent fleet records with fixed ISO
 *   update times, per-session transcript items — task, assistant, tool call,
 *   result, compaction marker — keyed by agent, dismiss/restore flags)
 * @output Full-height AI chat mock whose composer carries a docked sub-agent
 *   monitor: a summary bar (fleet icon, agent count, colored count clusters
 *   with a pulsing running dot and a faded dismissed counter) that expands
 *   into a bulk-action strip (Show dismissed / Restore all / Dismiss
 *   completed) and per-agent rows with StatusDot, truncated task title,
 *   status word, relative Timestamp, and a bordered "View" chip; dismissed
 *   agents sit under an uppercase DISMISSED micro-header. Over the page, an
 *   open transcript Dialog shows the failed agent's session: right-aligned
 *   TASK bubble, assistant replies, one-line tool chips, a CodeBlock result,
 *   a destructive-tinted error result, a centered compaction divider, and a
 *   "latest 50 messages" footer
 * @position Page template; emitted by `astryx template sub-agent-monitor`
 *
 * Frame: Layout height="fill". Slim LayoutHeader names the session and the
 * fleet state. LayoutContent (padding 0) hosts a centered chat column
 * (maxWidth 768): two dimmed placeholder turns give the page context, and
 * the ChatLayout composer slot stacks the monitor panel directly above a
 * disabled TextArea. The Dialog renders open over the page; an Overlay
 * scrim dims the column beneath it. Unlike ai-chat-tool-stream, the subject
 * is a *fleet of spawned agents* and their lifecycle — not one
 * conversation's tool calls.
 *
 * Responsive contract:
 * - Chat column: maxWidth 768, centered; only the transcript scrolls —
 *   header and composer (with the docked monitor) are fixed chrome.
 * - > 640px: monitor rows show a relative-time Timestamp column.
 * - <= 640px: rows drop the relative time; StatusDot, title, status word,
 *   and the View chip keep the row scannable.
 * - > 768px: Dialog is a standard modal (width 768, body scrolls within
 *   ~70vh).
 * - <= 768px: Dialog switches to the fullscreen variant.
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
import {Heading, Text} from '@astryxdesign/core/Text';
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Overlay} from '@astryxdesign/core/Overlay';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowPathIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered conversation column; ChatLayout owns transcript scrolling.
  chatColumn: {
    height: '100%',
    maxWidth: 768,
    marginInline: 'auto',
  },
  overlayFill: {
    display: 'block',
    height: '100%',
  },
  // The mock conversation is context, not the subject — keep it dimmed.
  dimmedTurns: {opacity: 0.55},
  // Docked monitor panel: card-like, tinted while an agent is running.
  panel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
  panelRunning: {borderColor: 'var(--color-warning)'},
  summaryCell: {minWidth: 0},
  fadedCluster: {opacity: 0.6},
  bulkStrip: {paddingBlock: 'var(--spacing-2)'},
  agentRow: {paddingBlock: 'var(--spacing-2)'},
  agentTitleCell: {minWidth: 0},
  dismissedRow: {opacity: 0.55},
  microHeader: {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    paddingTop: 'var(--spacing-2)',
  },
  composerArea: {paddingTop: 'var(--spacing-2)'},
  // Transcript dialog body rows.
  toolChip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  toolChipText: {minWidth: 0},
  errorResult: {
    border: 'var(--border-width) solid var(--color-error)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-error-muted)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  dialogBody: {overflowY: 'auto'},
};

// ============= DATA =============
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const SESSION_TITLE = 'Q3 launch prep';
const ORCHESTRATOR_NAME = 'Navi Orchestrator';

type AgentStatus = 'running' | 'done' | 'failed';

interface SubAgent {
  id: string;
  sessionId: string;
  title: string;
  status: AgentStatus;
  updatedAt: string; // fixed ISO timestamp
  isDismissed: boolean;
}

const INITIAL_AGENTS: SubAgent[] = [
  {
    id: 'ag-1',
    sessionId: 'sess_f7e8d9',
    title: 'Research competitor pricing',
    status: 'running',
    updatedAt: '2026-07-02T09:41:30Z',
    isDismissed: false,
  },
  {
    id: 'ag-2',
    sessionId: 'sess_b4c5d6',
    title: 'Draft Q3 launch email',
    status: 'done',
    updatedAt: '2026-07-02T09:37:00Z',
    isDismissed: false,
  },
  {
    id: 'ag-3',
    sessionId: 'sess_c7d8e9',
    title: 'Scrape docs sitemap',
    status: 'done',
    updatedAt: '2026-07-02T09:29:00Z',
    isDismissed: false,
  },
  {
    id: 'ag-4',
    sessionId: 'sess_a1b2c3',
    title: 'Deploy preview branch',
    status: 'failed',
    updatedAt: '2026-07-02T09:15:00Z',
    isDismissed: false,
  },
  {
    id: 'ag-5',
    sessionId: 'sess_d1e2f3',
    title: 'Summarize churn report',
    status: 'done',
    updatedAt: '2026-07-02T07:41:00Z',
    isDismissed: true,
  },
  {
    id: 'ag-6',
    sessionId: 'sess_e4f5a6',
    title: 'Update pricing table',
    status: 'done',
    updatedAt: '2026-07-02T06:41:00Z',
    isDismissed: true,
  },
];

const STATUS_WORD: Record<AgentStatus, string> = {
  running: 'Running',
  done: 'Done',
  failed: 'Failed',
};

const STATUS_DOT: Record<
  AgentStatus,
  'warning' | 'success' | 'error'
> = {
  running: 'warning',
  done: 'success',
  failed: 'error',
};

const STATUS_BADGE: Record<AgentStatus, 'warning' | 'success' | 'error'> = {
  running: 'warning',
  done: 'success',
  failed: 'error',
};

// Transcript items for the session Dialog. The failed deploy agent carries
// the full 8-item fixture; siblings keep short sessions so every View chip
// opens something real.
type TranscriptItem =
  | {kind: 'task'; text: string}
  | {kind: 'assistant'; text: string}
  | {kind: 'tool'; tool: string; command: string}
  | {kind: 'result'; code: string; isError?: boolean}
  | {kind: 'compaction'; text: string};

interface AgentSession {
  items: TranscriptItem[];
  hasMore: boolean;
}

const SESSIONS: Record<string, AgentSession> = {
  'ag-1': {
    items: [
      {kind: 'task', text: 'Compare our seat pricing against the top 5 competitors'},
      {kind: 'tool', tool: 'bash', command: 'rg -n "pricing" src/'},
      {
        kind: 'result',
        code: `src/marketing/pricing.ts:12: export const SEAT_TIERS = [
src/marketing/pricing.ts:41: // TODO: refresh competitor table`,
      },
      {kind: 'assistant', text: 'Crawling pricing pages now — 3 of 5 competitors captured.'},
    ],
    hasMore: false,
  },
  'ag-2': {
    items: [
      {kind: 'task', text: 'Draft the Q3 launch email for marketing review'},
      {
        kind: 'assistant',
        text: 'Draft is in drafts/q3-launch.md — flagged two open questions on tone for review.',
      },
    ],
    hasMore: false,
  },
  'ag-3': {
    items: [
      {kind: 'task', text: 'Scrape the docs sitemap and list stale pages'},
      {kind: 'tool', tool: 'bash', command: 'node scripts/scrape-sitemap.mjs docs.acme.dev'},
      {
        kind: 'result',
        code: `412 urls crawled
9 pages older than 180 days -> reports/stale-docs.json`,
      },
      {kind: 'assistant', text: 'Done — 9 stale pages listed in reports/stale-docs.json.'},
    ],
    hasMore: false,
  },
  // Dialog subject: the failed deploy, 8 items exactly as the run recorded.
  'ag-4': {
    items: [
      {kind: 'task', text: 'Deploy the preview branch for PR #482 and report the URL'},
      {kind: 'assistant', text: 'Starting the deploy — checking the branch first.'},
      {kind: 'tool', tool: 'bash', command: 'git fetch origin pull/482/head'},
      {
        kind: 'result',
        code: `From github.com:acme/navi
 * branch refs/pull/482/head -> FETCH_HEAD`,
      },
      {kind: 'tool', tool: 'bash', command: 'vercel deploy --prebuilt'},
      {
        kind: 'result',
        code: 'Error: exit 1 — Sandbox timed out after 120s',
        isError: true,
      },
      {kind: 'compaction', text: 'Context compacted (38 messages summarized)'},
      {
        kind: 'assistant',
        text: 'Deploy failed on sandbox timeout. Retry with a longer limit?',
      },
    ],
    hasMore: true,
  },
  'ag-5': {
    items: [
      {kind: 'task', text: 'Summarize the churn report for the growth sync'},
      {
        kind: 'assistant',
        text: 'Summary posted — churn is concentrated in the starter tier, mostly month 2.',
      },
    ],
    hasMore: false,
  },
  'ag-6': {
    items: [
      {kind: 'task', text: 'Update the pricing table with the new seat tiers'},
      {kind: 'tool', tool: 'edit', command: 'src/marketing/pricing.ts'},
      {kind: 'assistant', text: 'Pricing table updated; diff attached for review.'},
    ],
    hasMore: false,
  },
};

// ============= MONITOR ROWS =============

function AgentRow({
  agent,
  isCompact,
  onView,
  onDismiss,
  onRestore,
}: {
  agent: SubAgent;
  isCompact: boolean;
  onView: (id: string) => void;
  onDismiss: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  return (
    <HStack
      gap={2}
      vAlign="center"
      style={
        agent.isDismissed
          ? {...styles.agentRow, ...styles.dismissedRow}
          : styles.agentRow
      }>
      <StatusDot
        variant={STATUS_DOT[agent.status]}
        label={STATUS_WORD[agent.status]}
        isPulsing={agent.status === 'running'}
        tooltip={STATUS_WORD[agent.status]}
      />
      <StackItem size="fill" style={styles.agentTitleCell}>
        <Text type="body" maxLines={1}>
          {agent.title}
        </Text>
      </StackItem>
      <Text type="supporting" color="secondary">
        {STATUS_WORD[agent.status]}
      </Text>
      {!isCompact && (
        <Timestamp
          value={agent.updatedAt}
          format="relative"
          type="supporting"
          color="secondary"
        />
      )}
      <Button
        label={`View transcript: ${agent.title}`}
        variant="secondary"
        size="sm"
        onClick={() => onView(agent.id)}>
        View
      </Button>
      {agent.isDismissed ? (
        <Button
          label={`Restore: ${agent.title}`}
          variant="ghost"
          size="sm"
          onClick={() => onRestore(agent.id)}>
          Restore
        </Button>
      ) : (
        <IconButton
          label={`Dismiss: ${agent.title}`}
          tooltip="Dismiss"
          icon={<Icon icon={XMarkIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          isDisabled={agent.status === 'running'}
          onClick={() => onDismiss(agent.id)}
        />
      )}
    </HStack>
  );
}

// ============= TRANSCRIPT DIALOG BODY =============

function TranscriptItems({agent}: {agent: SubAgent}) {
  const session = SESSIONS[agent.id];
  return (
    <ChatMessageList density="compact">
      {session.items.map((item, index) => {
        const key = `${agent.id}-${index}`;
        switch (item.kind) {
          case 'task':
            // Right-aligned TASK bubble: the orchestrator's brief to the
            // sub-agent, with a micro-eyebrow instead of a sender name.
            return (
              <ChatMessage key={key} sender="user">
                <ChatMessageBubble name="TASK">{item.text}</ChatMessageBubble>
              </ChatMessage>
            );
          case 'assistant':
            return (
              <ChatMessage key={key} sender="assistant">
                <ChatMessageBubble>{item.text}</ChatMessageBubble>
              </ChatMessage>
            );
          case 'tool':
            // One-line tool chip: `bash: vercel deploy --prebuilt`.
            return (
              <div key={key} style={styles.toolChip}>
                <HStack gap={2} vAlign="center">
                  <Icon icon={Cog6ToothIcon} size="sm" color="secondary" />
                  <StackItem size="fill" style={styles.toolChipText}>
                    <Text type="code" size="sm" color="secondary" maxLines={1}>
                      {item.tool}: {item.command}
                    </Text>
                  </StackItem>
                </HStack>
              </div>
            );
          case 'result':
            // Failed tool output gets a destructive tint instead of the
            // neutral CodeBlock chrome.
            return item.isError === true ? (
              <div key={key} style={styles.errorResult}>
                <Text type="code" size="sm">
                  {item.code}
                </Text>
              </div>
            ) : (
              <CodeBlock
                key={key}
                code={item.code}
                language="bash"
                size="sm"
                width="100%"
                hasCopyButton={false}
              />
            );
          case 'compaction':
            return (
              <ChatSystemMessage key={key} variant="divider">
                {item.text}
              </ChatSystemMessage>
            );
        }
      })}
      {session.hasMore && (
        <ChatSystemMessage>
          Showing the latest 50 messages in this view.
        </ChatSystemMessage>
      )}
    </ChatMessageList>
  );
}

// ============= PAGE =============

export default function SubAgentMonitorTemplate() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [showDismissed, setShowDismissed] = useState(true);
  // The failed deploy's transcript opens over the page by default.
  const [dialogAgentId, setDialogAgentId] = useState<string | null>('ag-4');

  // Responsive contract: rows drop relative time at <= 640px; the Dialog
  // goes fullscreen at <= 768px.
  const isCompact = useMediaQuery('(max-width: 640px)');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const active = agents.filter(agent => !agent.isDismissed);
  const dismissed = agents.filter(agent => agent.isDismissed);
  const runningCount = active.filter(a => a.status === 'running').length;
  const doneCount = active.filter(a => a.status === 'done').length;
  const failedCount = active.filter(a => a.status === 'failed').length;
  const hasRunning = runningCount > 0;

  const dialogAgent = agents.find(agent => agent.id === dialogAgentId) ?? null;

  const dismissAgent = (id: string) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === id ? {...agent, isDismissed: true} : agent,
      ),
    );
  };

  const restoreAgent = (id: string) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === id ? {...agent, isDismissed: false} : agent,
      ),
    );
  };

  const restoreAll = () => {
    setAgents(prev => prev.map(agent => ({...agent, isDismissed: false})));
  };

  const dismissCompleted = () => {
    setAgents(prev =>
      prev.map(agent =>
        agent.status === 'done' ? {...agent, isDismissed: true} : agent,
      ),
    );
  };

  const closeDialog = (isOpen: boolean) => {
    if (!isOpen) {
      setDialogAgentId(null);
    }
  };

  // Summary bar: fleet icon, agent count, colored count clusters. Rendered
  // inside the Collapsible trigger, so every cluster stays non-interactive.
  const summaryBar = (
    <HStack gap={3} vAlign="center">
      <Icon icon={UserGroupIcon} size="sm" color="secondary" />
      <StackItem size="fill" style={styles.summaryCell}>
        <Text type="label" maxLines={1}>
          {agents.length} sub-agents
        </Text>
      </StackItem>
      {runningCount > 0 && (
        <HStack gap={1} vAlign="center">
          <StatusDot variant="warning" label="Running" isPulsing />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {runningCount} running
          </Text>
        </HStack>
      )}
      {doneCount > 0 && (
        <HStack gap={1} vAlign="center">
          <StatusDot variant="success" label="Done" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {doneCount} done
          </Text>
        </HStack>
      )}
      {failedCount > 0 && (
        <HStack gap={1} vAlign="center">
          <StatusDot variant="error" label="Failed" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {failedCount} failed
          </Text>
        </HStack>
      )}
      {dismissed.length > 0 && (
        <Tooltip content="Dismissed agents stay under the DISMISSED section">
          <div style={styles.fadedCluster}>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              +{dismissed.length} dismissed
            </Text>
          </div>
        </Tooltip>
      )}
    </HStack>
  );

  const monitorPanel = (
    <div
      style={
        hasRunning ? {...styles.panel, ...styles.panelRunning} : styles.panel
      }>
      <Collapsible
        isOpen={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        trigger={summaryBar}>
        <VStack gap={0}>
          {/* Bulk-action strip. */}
          <HStack gap={2} vAlign="center" style={styles.bulkStrip}>
            <Button
              label={showDismissed ? 'Hide dismissed' : 'Show dismissed'}
              variant="ghost"
              size="sm"
              isDisabled={dismissed.length === 0}
              onClick={() => setShowDismissed(prev => !prev)}
            />
            <Button
              label="Restore all"
              variant="ghost"
              size="sm"
              isDisabled={dismissed.length === 0}
              onClick={restoreAll}
            />
            <StackItem size="fill" />
            <Button
              label={`Dismiss ${doneCount} completed`}
              variant="ghost"
              size="sm"
              isDisabled={doneCount === 0}
              onClick={dismissCompleted}
            />
          </HStack>
          <Divider />
          {active.length > 0 ? (
            active.map(agent => (
              <AgentRow
                key={agent.id}
                agent={agent}
                isCompact={isCompact}
                onView={setDialogAgentId}
                onDismiss={dismissAgent}
                onRestore={restoreAgent}
              />
            ))
          ) : (
            <div style={styles.agentRow}>
              <Text type="supporting" color="secondary">
                No active sub-agents — everything is dismissed.
              </Text>
            </div>
          )}
          {/* DISMISSED section under an uppercase micro-header. */}
          {showDismissed && dismissed.length > 0 && (
            <VStack gap={0}>
              <div style={styles.microHeader}>
                <Text type="label" size="sm" color="secondary">
                  Dismissed
                </Text>
              </div>
              {dismissed.map(agent => (
                <AgentRow
                  key={agent.id}
                  agent={agent}
                  isCompact={isCompact}
                  onView={setDialogAgentId}
                  onDismiss={dismissAgent}
                  onRestore={restoreAgent}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </Collapsible>
    </div>
  );

  // Composer: monitor panel docked directly above a disabled TextArea —
  // the orchestrator holds the floor while sub-agents run.
  const composer = (
    <VStack gap={2} style={styles.composerArea}>
      {monitorPanel}
      <TextArea
        label={`Message ${ORCHESTRATOR_NAME}`}
        isLabelHidden
        rows={2}
        placeholder="Composer paused while sub-agents run..."
        value=""
        onChange={() => {}}
        isDisabled
      />
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>{SESSION_TITLE}</Heading>
                <StatusDot
                  variant="warning"
                  label="Fleet running"
                  isPulsing={hasRunning}
                />
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    {ORCHESTRATOR_NAME}
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Button label="New session" variant="secondary" size="sm" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.chatColumn}>
            {/* Overlay scrim dims the page column while the transcript
                Dialog is open above it. */}
            <Overlay
              isOpen={dialogAgent != null}
              scrim="dark"
              content={<span aria-hidden />}
              style={styles.overlayFill}>
              <ChatLayout composer={composer}>
                <ChatMessageList density="balanced">
                  <ChatSystemMessage variant="divider">
                    Thursday, July 2
                  </ChatSystemMessage>
                  {/* Dimmed placeholder turns: the conversation that spawned
                      the fleet — context, not the subject. */}
                  <div style={styles.dimmedTurns}>
                    <ChatMessageList density="balanced">
                      <ChatMessage sender="user">
                        <ChatMessageBubble
                          metadata={
                            <ChatMessageMetadata
                              timestamp={
                                <Timestamp
                                  value="2026-07-02T09:12:00Z"
                                  format="time"
                                />
                              }
                            />
                          }>
                          Spin up sub-agents for launch prep: pricing research,
                          the announcement email, a docs audit, and a preview
                          deploy of PR #482.
                        </ChatMessageBubble>
                      </ChatMessage>
                      <ChatMessage
                        sender="assistant"
                        avatar={<Avatar name={ORCHESTRATOR_NAME} size="small" />}>
                        <ChatMessageBubble name={ORCHESTRATOR_NAME}>
                          Spawned the fleet — progress is tracked in the
                          monitor docked below. I will fold results into this
                          thread as each agent lands.
                        </ChatMessageBubble>
                        <ChatMessageMetadata
                          timestamp={
                            <Timestamp
                              value="2026-07-02T09:13:20Z"
                              format="time"
                            />
                          }
                        />
                      </ChatMessage>
                    </ChatMessageList>
                  </div>
                </ChatMessageList>
              </ChatLayout>
            </Overlay>
          </div>

          {/* Transcript drill-in for one sub-agent's session. */}
          <Dialog
            isOpen={dialogAgent != null}
            onOpenChange={closeDialog}
            width={768}
            maxHeight="70vh"
            variant={isMobile ? 'fullscreen' : 'standard'}>
            {dialogAgent != null && (
              <Layout
                header={
                  <DialogHeader
                    title={dialogAgent.title}
                    subtitle={`Latest sub-agent transcript · ${dialogAgent.sessionId}`}
                    onOpenChange={closeDialog}
                    endContent={
                      <HStack gap={2} vAlign="center">
                        <Badge
                          variant={STATUS_BADGE[dialogAgent.status]}
                          label={STATUS_WORD[dialogAgent.status]}
                        />
                        <IconButton
                          label="Refresh transcript"
                          tooltip="Refresh"
                          icon={
                            <Icon
                              icon={ArrowPathIcon}
                              size="sm"
                              color="inherit"
                            />
                          }
                          variant="ghost"
                          size="sm"
                          onClick={() => {}}
                        />
                        <Button
                          label="Full session"
                          variant="secondary"
                          size="sm"
                          onClick={() => {}}
                        />
                      </HStack>
                    }
                  />
                }
                content={
                  <LayoutContent style={styles.dialogBody}>
                    <TranscriptItems agent={dialogAgent} />
                  </LayoutContent>
                }
              />
            )}
          </Dialog>
        </LayoutContent>
      }
    />
  );
}
