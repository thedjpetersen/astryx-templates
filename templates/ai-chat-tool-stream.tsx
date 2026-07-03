// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (CI-debugging transcript, tool-call
 *   records with fixed ISO start times and durations, token-allocation
 *   breakdown, queued follow-ups, suggested actions)
 * @output Full-height AI chat focused on agent tool execution: slim header
 *   with session title, model Selector, and a context-usage meter whose
 *   Popover breaks token allocation down by category; a scrolling
 *   conversation where assistant turns carry collapsed "tool piles"
 *   (overlapped Card stack + count Badge) that expand into per-call rows
 *   with StatusDot, start time, duration, and CodeBlock output; a streaming
 *   turn with Spinner + collapsible thinking block; dismissible suggestion
 *   pills; and a fixed composer with attachment Tokens and a queued
 *   follow-up strip
 * @position Page template; emitted by `astryx template ai-chat-tool-stream`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * agent status, model Selector, context meter). LayoutContent (padding 0)
 * hosts a centered ChatLayout — the transcript scrolls, the composer stays
 * pinned. No side panels: unlike ai-chat-artifact this surface is about
 * *how the agent worked* (tool execution), not what it produced.
 *
 * Responsive contract:
 * - Conversation column: maxWidth 880, centered; only the transcript
 *   scrolls — header and composer are fixed chrome.
 * - >720px: the context meter shows an inline ProgressBar next to the
 *   percentage button; tool rows include a start-time Timestamp column.
 * - <=720px: the meter collapses to the percentage button (the Popover
 *   breakdown is unchanged); tool rows drop the start-time column and
 *   keep the duration; suggestion pills wrap onto multiple lines.
 * - Touch controls are size "sm" (28px) above 720px; <=720px the composer
 *   buttons (attach, Stop agent, Queue message), queued-pill actions, and
 *   suggestion pills grow to 40px hit targets (icon glyphs and labels stay
 *   "sm") so the primary interactions stay tappable.
 * - Queued follow-up strip scrolls horizontally; pills keep intrinsic
 *   width (flexShrink 0) so actions never crush the message preview.
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
import {Card} from '@astryxdesign/core/Card';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Popover} from '@astryxdesign/core/Popover';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  RefreshCwIcon,
  SendIcon,
  TerminalIcon,
  SearchIcon,
  SquarePenIcon,
  PaperclipIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered conversation column; ChatLayout owns transcript scrolling.
  chatColumn: {
    height: '100%',
    maxWidth: 880,
    marginInline: 'auto',
  },
  // Tool pile: relative wrapper leaves headroom for the back plates that
  // peek above the top card (translateY(-...px)).
  pileWrap: {
    position: 'relative',
    marginTop: 'var(--spacing-2)',
  },
  pilePlate: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
  },
  pilePlateFar: {transform: 'translateY(-7px) scale(0.97)'},
  pilePlateNear: {transform: 'translateY(-3.5px) scale(0.985)'},
  // The top card must paint above the plates (positioned, later in DOM).
  pileCard: {position: 'relative'},
  pileTriggerCell: {minWidth: 0},
  toolRow: {paddingBlock: 'var(--spacing-2)'},
  thinkingBody: {paddingBlock: 'var(--spacing-1)'},
  suggestionRow: {paddingTop: 'var(--spacing-2)'},
  suggestionWrap: {flexWrap: 'wrap'},
  // Composer footer (pinned by ChatLayout).
  composerArea: {paddingTop: 'var(--spacing-2)'},
  queueStrip: {overflowX: 'auto', paddingBottom: 'var(--spacing-1)'},
  queuedPill: {
    flexShrink: 0,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  queuedPillText: {maxWidth: 240, minWidth: 0},
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
  attachmentWrap: {flexWrap: 'wrap'},
  // <=720px: grow the touch controls to 40px hit targets (the "sm" 28px
  // box is fine for pointers but too small for thumbs); icon glyphs and
  // labels stay "sm" so the rows read the same, just with more padding.
  iconTapTarget: {width: 40, height: 40},
  buttonTapTarget: {height: 40},
  meterBar: {width: 96},
  popoverBody: {padding: 'var(--spacing-3)'},
};

// ============= DATA =============
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const SESSION_TITLE = 'checkout-service CI failure';
const ASSISTANT_NAME = 'Pipeline Copilot';

const MODEL_OPTIONS = [
  {value: 'atlas-swe-2', label: 'atlas-swe-2'},
  {value: 'atlas-swe-2-mini', label: 'atlas-swe-2-mini'},
  {value: 'atlas-reasoner-1', label: 'atlas-reasoner-1'},
];

// Context-window allocation shown in the meter Popover. Sums to 81,900
// of a 200,000-token window (41% used).
const CONTEXT_WINDOW = 200000;
const CONTEXT_USED = 81900;
const CONTEXT_USED_PCT = 41;
const CONTEXT_SEGMENTS: ReadonlyArray<{
  id: string;
  label: string;
  tokens: number;
  display: string;
  variant: 'accent' | 'success' | 'warning' | 'neutral' | 'error';
}> = [
  {
    id: 'system',
    label: 'System prompt',
    tokens: 9400,
    display: '9.4K',
    variant: 'neutral',
  },
  {
    id: 'files',
    label: 'Files',
    tokens: 22100,
    display: '22.1K',
    variant: 'success',
  },
  {
    id: 'skills',
    label: 'Skills',
    tokens: 6200,
    display: '6.2K',
    variant: 'warning',
  },
  {
    id: 'tools',
    label: 'Tool results',
    tokens: 18700,
    display: '18.7K',
    variant: 'error',
  },
  {
    id: 'messages',
    label: 'Messages',
    tokens: 25500,
    display: '25.5K',
    variant: 'accent',
  },
];

type ToolKind = 'bash' | 'edit' | 'search';
type ToolStatus = 'running' | 'success' | 'error';

interface ToolCall {
  id: string;
  kind: ToolKind;
  name: string;
  target: string;
  status: ToolStatus;
  startedAt: string; // fixed ISO timestamp
  duration: string;
  output?: {language: string; code: string};
}

const TOOL_ICON: Record<ToolKind, typeof TerminalIcon> = {
  bash: TerminalIcon,
  edit: SquarePenIcon,
  search: SearchIcon,
};

const TOOL_STATUS_DOT: Record<
  Exclude<ToolStatus, 'running'>,
  {variant: 'success' | 'error'; label: string}
> = {
  success: {variant: 'success', label: 'Succeeded'},
  error: {variant: 'error', label: 'Failed'},
};

// Diagnostic pass: five consecutive calls; the reproduce step fails on
// purpose — that failure *is* the finding.
const DIAGNOSIS_CALLS: ToolCall[] = [
  {
    id: 'tc-1',
    kind: 'bash',
    name: 'bash',
    target: 'gh run view 4128 --log-failed',
    status: 'success',
    startedAt: '2026-07-01T14:02:41',
    duration: '1.6s',
    output: {
      language: 'bash',
      code: `build  Install dependencies  ERR_PNPM_OUTDATED_LOCKFILE
build  Install dependencies  Cannot install with "frozen-lockfile"
build  Process completed with exit code 1.`,
    },
  },
  {
    id: 'tc-2',
    kind: 'bash',
    name: 'bash',
    target: 'gh run list --workflow deploy.yml --limit 5',
    status: 'success',
    startedAt: '2026-07-01T14:02:48',
    duration: '0.9s',
    output: {
      language: 'bash',
      code: `failure  deploy  #4128  push  main  2m14s
failure  deploy  #4127  push  main  2m09s
failure  deploy  #4126  push  main  2m11s
success  deploy  #4125  push  main  8m47s
success  deploy  #4124  push  main  8m52s`,
    },
  },
  {
    id: 'tc-3',
    kind: 'search',
    name: 'grep',
    target: 'grep -n "node-version" .github/workflows/deploy.yml',
    status: 'success',
    startedAt: '2026-07-01T14:03:02',
    duration: '0.3s',
    output: {
      language: 'bash',
      code: `18:        node-version: 20.x
64:        node-version: 20.x`,
    },
  },
  {
    id: 'tc-4',
    kind: 'bash',
    name: 'bash',
    target: 'docker run --rm ghcr.io/lumen/ci-runner:latest node --version',
    status: 'success',
    startedAt: '2026-07-01T14:03:11',
    duration: '4.2s',
    output: {
      language: 'bash',
      code: 'v20.19.0',
    },
  },
  {
    id: 'tc-5',
    kind: 'bash',
    name: 'bash',
    target: 'pnpm install --frozen-lockfile',
    status: 'error',
    startedAt: '2026-07-01T14:03:24',
    duration: '12.8s',
    output: {
      language: 'bash',
      code: `ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
because pnpm-lock.yaml is not up to date with package.json

Note: corepack resolved pnpm@8.15.4 under Node v20.19.0; the lockfile
was written by pnpm@8.9.2 (lockfileVersion 6.0 -> 6.1 mismatch).`,
    },
  },
];

// Fix pass, still in flight: the rerun is the live call at the top of
// the pile while the assistant streams.
const FIX_CALLS: ToolCall[] = [
  {
    id: 'tc-6',
    kind: 'edit',
    name: 'edit_file',
    target: '.github/workflows/deploy.yml',
    status: 'success',
    startedAt: '2026-07-01T14:08:31',
    duration: '2.1s',
    output: {
      language: 'diff',
      code: `@@ jobs.build.steps @@
-        node-version: 20.x
+        node-version-file: .nvmrc
@@ jobs.deploy.steps @@
-        node-version: 20.x
+        node-version-file: .nvmrc`,
    },
  },
  {
    id: 'tc-7',
    kind: 'bash',
    name: 'bash',
    target: 'actionlint .github/workflows/deploy.yml',
    status: 'success',
    startedAt: '2026-07-01T14:08:40',
    duration: '0.7s',
    output: {
      language: 'bash',
      code: 'deploy.yml: workflow OK, 0 findings',
    },
  },
  {
    id: 'tc-8',
    kind: 'bash',
    name: 'bash',
    target: 'gh run rerun 4128 --job build',
    status: 'running',
    startedAt: '2026-07-01T14:08:52',
    duration: 'running',
    output: {
      language: 'bash',
      code: `Requested rerun of job build (run 4128)
waiting for ci-runner pool (position 2)...`,
    },
  },
];

const THINKING_TEXT =
  'The workflow reads node-version: 20.x in both the build and deploy ' +
  'jobs, so pinning only one would let them drift apart. Pointing both at ' +
  'node-version-file keeps .nvmrc the single source of truth. A targeted ' +
  'rerun of the failed build job is cheaper than a full pipeline run and ' +
  'proves the fix on exactly the job that broke.';

interface Suggestion {
  id: string;
  label: string;
}

const INITIAL_SUGGESTIONS: Suggestion[] = [
  {id: 'sg-1', label: 'Watch the rerun and report back'},
  {id: 'sg-2', label: 'Open a PR with the workflow fix'},
  {id: 'sg-3', label: 'Add a lockfile check to pre-merge'},
];

type QueuedStatus = 'queued' | 'failed';

interface QueuedFollowUp {
  id: string;
  text: string;
  status: QueuedStatus;
}

const INITIAL_QUEUE: QueuedFollowUp[] = [
  {
    id: 'q-1',
    text: 'Once the rerun is green, diff the runner image against last week',
    status: 'queued',
  },
  {
    id: 'q-2',
    text: 'Post the root cause summary in #eng-releases',
    status: 'failed',
  },
];

const INITIAL_ATTACHMENTS = ['ci-build-4128.log', 'deploy.yml'];

// ============= TOOL PILE =============

function ToolCallRow({call, isCompact}: {call: ToolCall; isCompact: boolean}) {
  return (
    <VStack gap={2} style={styles.toolRow}>
      <HStack gap={2} vAlign="center">
        <Icon icon={TOOL_ICON[call.kind]} size="sm" color="secondary" />
        <Text type="code" size="sm">
          {call.name}
        </Text>
        <StackItem size="fill" style={styles.pileTriggerCell}>
          <Text type="code" size="sm" color="secondary" maxLines={1}>
            {call.target}
          </Text>
        </StackItem>
        {call.status === 'running' ? (
          <Spinner size="sm" aria-label="Running" />
        ) : (
          <StatusDot
            variant={TOOL_STATUS_DOT[call.status].variant}
            label={TOOL_STATUS_DOT[call.status].label}
          />
        )}
        {!isCompact && (
          <Timestamp
            value={call.startedAt}
            format="time"
            type="supporting"
            color="secondary"
          />
        )}
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {call.duration}
        </Text>
      </HStack>
      {call.output != null && (
        <CodeBlock
          code={call.output.code}
          language={call.output.language}
          size="sm"
          width="100%"
          hasCopyButton={false}
        />
      )}
    </VStack>
  );
}

/**
 * Collapsed "tool pile": the latest call is the visible trigger card and
 * up to two back plates peek above it for depth; a Badge carries the
 * total count. Expanding (Collapsible) flattens the pile into one row
 * per call with status, timing, and command output.
 */
function ToolPile({
  calls,
  defaultIsOpen = false,
  isCompact,
}: {
  calls: ToolCall[];
  defaultIsOpen?: boolean;
  isCompact: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const topCall = calls[calls.length - 1];
  const hasRunning = calls.some(call => call.status === 'running');
  const lastIndex = calls.length - 1;

  return (
    <div style={styles.pileWrap}>
      {!isOpen && calls.length >= 3 && (
        <div style={{...styles.pilePlate, ...styles.pilePlateFar}} aria-hidden />
      )}
      {!isOpen && calls.length >= 2 && (
        <div
          style={{...styles.pilePlate, ...styles.pilePlateNear}}
          aria-hidden
        />
      )}
      <div style={styles.pileCard}>
        <Card padding={3}>
          <Collapsible
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            trigger={
              <HStack gap={2} vAlign="center">
                <Icon
                  icon={TOOL_ICON[topCall.kind]}
                  size="sm"
                  color="secondary"
                />
                <StackItem size="fill" style={styles.pileTriggerCell}>
                  <Text type="code" size="sm" color="secondary" maxLines={1}>
                    {topCall.target}
                  </Text>
                </StackItem>
                <Badge label={`${calls.length} calls`} variant="neutral" />
                {hasRunning ? (
                  <Spinner size="sm" aria-label="Tool running" />
                ) : topCall.status === 'error' ? (
                  <StatusDot variant="error" label="Last call failed" />
                ) : (
                  <StatusDot variant="success" label="All calls succeeded" />
                )}
              </HStack>
            }>
            <VStack gap={0}>
              {calls.map((call, index) => (
                <VStack key={call.id} gap={0}>
                  <ToolCallRow call={call} isCompact={isCompact} />
                  {index < lastIndex && <Divider />}
                </VStack>
              ))}
            </VStack>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}

// ============= QUEUED FOLLOW-UPS =============

function QueuedFollowUpPill({
  item,
  isCompact,
  onSend,
  onRemove,
}: {
  item: QueuedFollowUp;
  isCompact: boolean;
  onSend: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const isFailed = item.status === 'failed';
  const tapTargetStyle = isCompact ? styles.iconTapTarget : undefined;
  return (
    <HStack gap={2} vAlign="center" style={styles.queuedPill}>
      <Badge
        label={isFailed ? 'Failed' : 'Queued'}
        variant={isFailed ? 'error' : 'neutral'}
      />
      <div style={styles.queuedPillText}>
        <Text type="supporting" maxLines={1}>
          {item.text}
        </Text>
      </div>
      <IconButton
        label={isFailed ? `Retry: ${item.text}` : `Send now: ${item.text}`}
        tooltip={isFailed ? 'Retry' : 'Send now'}
        icon={
          <Icon
            icon={isFailed ? RefreshCwIcon : SendIcon}
            size="sm"
            color="inherit"
          />
        }
        variant="ghost"
        size="sm"
        style={tapTargetStyle}
        onClick={() => onSend(item.id)}
      />
      <IconButton
        label={`Remove from queue: ${item.text}`}
        tooltip="Remove"
        icon={<Icon icon={XIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTargetStyle}
        onClick={() => onRemove(item.id)}
      />
    </HStack>
  );
}

// ============= PAGE =============

export default function AiChatToolStreamTemplate() {
  const [model, setModel] = useState('atlas-swe-2');
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [attachments, setAttachments] = useState(INITIAL_ATTACHMENTS);
  const [draft, setDraft] = useState('');
  // Deterministic id counter for messages queued from the composer.
  const [nextQueueId, setNextQueueId] = useState(3);

  const isCompact = useMediaQuery('(max-width: 720px)');

  const dismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(item => item.id !== id));
  };

  const removeQueued = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  // "Send now" hands the follow-up to the agent; it leaves the queue.
  const sendQueued = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const removeAttachment = (name: string) => {
    setAttachments(prev => prev.filter(item => item !== name));
  };

  // The agent is mid-turn, so composer submits join the follow-up queue.
  const queueDraft = (value: string) => {
    const text = value.trim();
    if (text.length === 0) {
      return;
    }
    setQueue(prev => [...prev, {id: `q-${nextQueueId}`, text, status: 'queued'}]);
    setNextQueueId(prev => prev + 1);
    setDraft('');
  };

  const contextBreakdown = (
    <div style={styles.popoverBody}>
      <VStack gap={3}>
        <VStack gap={1}>
          <Text type="label">Context window</Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            81,900 of 200,000 tokens · compaction at 85%
          </Text>
        </VStack>
        {CONTEXT_SEGMENTS.map(segment => (
          <VStack key={segment.id} gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting">{segment.label}</Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {segment.display}
              </Text>
            </HStack>
            <ProgressBar
              value={segment.tokens}
              max={CONTEXT_WINDOW}
              label={`${segment.label} token usage`}
              isLabelHidden
              variant={segment.variant}
            />
          </VStack>
        ))}
        <Text type="supporting" color="secondary" hasTabularNumbers>
          118,100 tokens free before auto-compaction
        </Text>
      </VStack>
    </div>
  );

  const composer = (
    <VStack gap={2} style={styles.composerArea}>
      {queue.length > 0 && (
        <HStack gap={2} vAlign="center" style={styles.queueStrip}>
          <Text type="label" size="sm" color="secondary">
            Queued
          </Text>
          {queue.map(item => (
            <QueuedFollowUpPill
              key={item.id}
              item={item}
              isCompact={isCompact}
              onSend={sendQueued}
              onRemove={removeQueued}
            />
          ))}
        </HStack>
      )}
      <div style={styles.composerCard}>
        <VStack gap={2}>
          {attachments.length > 0 && (
            <HStack gap={1} style={styles.attachmentWrap}>
              {attachments.map(name => (
                <Token
                  key={name}
                  label={name}
                  size="sm"
                  onRemove={() => removeAttachment(name)}
                />
              ))}
            </HStack>
          )}
          <TextArea
            label={`Message ${ASSISTANT_NAME}`}
            isLabelHidden
            rows={2}
            placeholder="Reply — messages queue while the agent is running..."
            value={draft}
            onChange={setDraft}
          />
          <HStack gap={2} vAlign="center">
            <IconButton
              label="Attach file"
              tooltip="Attach file"
              icon={<Icon icon={PaperclipIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              style={isCompact ? styles.iconTapTarget : undefined}
              onClick={() => {}}
            />
            <Text type="supporting" color="secondary">
              Agent is running — new messages join the queue
            </Text>
            <StackItem size="fill" />
            <Button
              label="Stop agent"
              variant="ghost"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              onClick={() => {}}
            />
            <Button
              label="Queue message"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              onClick={() => queueDraft(draft)}
            />
          </HStack>
        </VStack>
      </div>
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
                <StatusDot variant="accent" label="Agent running" />
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    sandbox: ci-runner
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Selector
              label="Model"
              isLabelHidden
              size="sm"
              options={MODEL_OPTIONS}
              value={model}
              onChange={setModel}
            />
            <Popover
              label="Context window breakdown"
              placement="below"
              alignment="end"
              width={320}
              content={contextBreakdown}>
              <HStack gap={2} vAlign="center">
                {!isCompact && (
                  <div style={styles.meterBar}>
                    <ProgressBar
                      value={CONTEXT_USED}
                      max={CONTEXT_WINDOW}
                      label="Context window used"
                      isLabelHidden
                    />
                  </div>
                )}
                <Button
                  label={`${CONTEXT_USED_PCT}% context`}
                  variant="ghost"
                  size="sm"
                />
              </HStack>
            </Popover>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.chatColumn}>
            <ChatLayout composer={composer}>
              <ChatMessageList density="balanced">
                <ChatSystemMessage variant="divider">
                  Wednesday, July 1
                </ChatSystemMessage>
                <ChatSystemMessage>
                  {ASSISTANT_NAME} can run commands and edit files in the
                  ci-runner sandbox.
                </ChatSystemMessage>

                {/* User: report the failure. */}
                <ChatMessage sender="user">
                  <ChatMessageBubble
                    metadata={
                      <ChatMessageMetadata
                        timestamp={
                          <Timestamp value="2026-07-01T14:02:00" format="time" />
                        }
                      />
                    }>
                    Deploy run #4128 for checkout-service has failed three
                    times on the build job. Nothing changed in app code since
                    Friday — can you find out what broke?
                  </ChatMessageBubble>
                </ChatMessage>

                {/* Assistant: diagnosis with a collapsed 5-call tool pile. */}
                <ChatMessage
                  sender="assistant"
                  avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                  <ChatMessageBubble name={ASSISTANT_NAME}>
                    The build job dies during dependency install, not in
                    tests. I pulled the failed logs and reproduced the error
                    in the sandbox: the ci-runner image silently moved to
                    Node 20.19 overnight, corepack now resolves a newer pnpm,
                    and that pnpm refuses the committed lockfile. The full
                    trail is in the calls below — the last one is the
                    deliberate reproduction.
                  </ChatMessageBubble>
                  <ToolPile calls={DIAGNOSIS_CALLS} isCompact={isCompact} />
                  <ChatMessageMetadata
                    timestamp={
                      <Timestamp value="2026-07-01T14:04:10" format="time" />
                    }
                  />
                </ChatMessage>

                {/* User: approve the fix. */}
                <ChatMessage sender="user">
                  <ChatMessageBubble
                    metadata={
                      <ChatMessageMetadata
                        timestamp={
                          <Timestamp value="2026-07-01T14:07:30" format="time" />
                        }
                      />
                    }>
                    The floating 20.x strikes again. Pin the runner to the
                    version in .nvmrc and rerun just the failed job.
                  </ChatMessageBubble>
                </ChatMessage>

                {/* Assistant: streaming turn — thinking block, live pile,
                    partial ghost bubble. */}
                <ChatMessage
                  sender="assistant"
                  avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                  <Collapsible
                    defaultIsOpen
                    trigger={
                      <HStack gap={2} vAlign="center">
                        <Spinner size="sm" aria-label="Assistant thinking" />
                        <Text type="supporting" color="secondary">
                          Thinking…
                        </Text>
                      </HStack>
                    }>
                    <div style={styles.thinkingBody}>
                      <Text type="supporting" color="secondary">
                        {THINKING_TEXT}
                      </Text>
                    </div>
                  </Collapsible>
                  <ToolPile
                    calls={FIX_CALLS}
                    defaultIsOpen
                    isCompact={isCompact}
                  />
                  <ChatMessageBubble variant="ghost">
                    Pinned both jobs to the .nvmrc version and kicked off a
                    rerun of the failed build job — watching the runner queue
                    now
                  </ChatMessageBubble>
                </ChatMessage>

                {/* Suggested actions: dismiss on click. */}
                {suggestions.length > 0 && (
                  <div style={styles.suggestionRow}>
                    <HStack gap={2} style={styles.suggestionWrap}>
                      {suggestions.map(suggestion => (
                        <Button
                          key={suggestion.id}
                          label={suggestion.label}
                          variant="secondary"
                          size="sm"
                          style={isCompact ? styles.buttonTapTarget : undefined}
                          onClick={() => dismissSuggestion(suggestion.id)}
                        />
                      ))}
                    </HStack>
                  </div>
                )}
              </ChatMessageList>
            </ChatLayout>
          </div>
        </LayoutContent>
      }
    />
  );
}
