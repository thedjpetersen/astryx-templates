// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (two-turn deploy-prep transcript, queued
 *   follow-ups in three states, typed attachment chips with one upload
 *   failure, four invented models with reasoning-effort defaults, five nodes
 *   with specs + pricing + relative cost scale, token-allocation breakdown,
 *   grouped slash-command catalog)
 * @output Full-height AI chat whose centerpiece is a maximal composer: the
 *   transcript stays at two turns while the composer card stacks queued
 *   follow-up rows (Queued / Sending / Failed with a stale hint), attachment
 *   chips with an error specimen, an active "/compact" slash chip whose
 *   grouped command menu Popover renders open above the field, and a dense
 *   control row — attach DropdownMenu, mic, model selector Popover (models +
 *   REASONING EFFORT SegmentedControl + EXTENDED THINKING Switch), node
 *   selector Popover with pricing column and $-scale glyphs plus a locked
 *   row, a context meter with token-breakdown Popover, Stop + destructive
 *   Force-stop AlertDialog, and a round Send button with a split Send /
 *   Send-in-Fork menu. A Kbd hint row closes the card.
 * @position Page template; emitted by `astryx template ai-chat-composer-suite`
 *
 * Frame: Layout height="fill". LayoutHeader carries slim chrome (session
 * title, agent status, workspace tag). LayoutContent (padding 0) hosts a
 * centered ChatLayout — the short transcript scrolls, the composer suite is
 * pinned. No side panels: unlike ai-chat-tool-stream this surface is about
 * *what you can send and where it runs*, not how the agent worked.
 *
 * Responsive contract:
 * - Conversation column: maxWidth 760, centered; composer card maxWidth 680,
 *   centered inside it. Only the transcript scrolls.
 * - Width is measured with a local ResizeObserver (useElementWidth) because
 *   the demo stage renders narrower than the viewport; viewport media
 *   queries never fire in the inline stage.
 * - >720px: the context meter shows an inline mini ProgressBar next to the
 *   percentage button; queued rows show the stale hint; the header shows the
 *   workspace tag.
 * - <=720px: the meter collapses to the percentage button (the Popover
 *   breakdown is unchanged), stale hints and the workspace tag drop, and the
 *   control row wraps onto multiple lines (flexWrap) so every control stays
 *   reachable.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
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
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Item} from '@astryxdesign/core/Item';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Popover} from '@astryxdesign/core/Popover';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {
  AppWindowIcon,
  CheckIcon,
  ChevronDownIcon,
  CornerDownRightIcon,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  LockIcon,
  MicIcon,
  MonitorIcon,
  PaperclipIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  SendIcon,
  SlashIcon,
  SparklesIcon,
  TerminalIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  wrap: {height: '100%'},
  // Centered conversation column; ChatLayout owns transcript scrolling.
  chatColumn: {
    height: '100%',
    maxWidth: 760,
    marginInline: 'auto',
  },
  composerArea: {
    paddingTop: 'var(--spacing-2)',
    maxWidth: 680,
    width: '100%',
    marginInline: 'auto',
  },
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
  // 10-11px uppercase tracking-wide section eyebrow.
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    fontWeight: 600,
  },
  queuedRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  queuedText: {minWidth: 0},
  staleHint: {color: 'var(--color-warning)'},
  chipWrap: {flexWrap: 'wrap'},
  chip: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  chipError: {
    borderColor: 'var(--color-error)',
    backgroundColor: 'var(--color-error-muted)',
  },
  chipName: {minWidth: 0, maxWidth: 160},
  controlRow: {flexWrap: 'wrap'},
  meterBar: {width: 72},
  roundSend: {borderRadius: '999px'},
  kbdRow: {justifyContent: 'center', flexWrap: 'wrap'},
  popoverBody: {padding: 'var(--spacing-3)'},
  // Slash menu: the keyboard-active row carries a visible focus ring.
  slashActive: {
    backgroundColor: 'var(--color-background-muted)',
    outline: '2px solid var(--color-accent)',
    outlineOffset: -2,
    borderRadius: 'var(--radius-container)',
  },
  // $-scale: lit glyphs full strength, unlit dimmed.
  costDim: {opacity: 0.35},
  nodePriceCell: {textAlign: 'right'},
  lockNote: {color: 'var(--color-warning)'},
  defaultDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    display: 'inline-block',
    flexShrink: 0,
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const SESSION_TITLE = 'gateway-api staging deploy';
const ASSISTANT_NAME = 'Helm Copilot';

// --- Models ---

interface ModelOption {
  id: string;
  name: string;
  description: string;
  isExperimental: boolean;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'relay-ultra',
    name: 'Relay Ultra',
    description: 'Deep multi-step agent work',
    isExperimental: false,
  },
  {
    id: 'relay-pro',
    name: 'Relay Pro',
    description: 'Balanced daily driver',
    isExperimental: false,
  },
  {
    id: 'relay-flash',
    name: 'Relay Flash',
    description: 'Fast and cheap for quick edits',
    isExperimental: false,
  },
  {
    id: 'relay-labs-1',
    name: 'Relay Labs-1',
    description: 'Preview weights — may regress',
    isExperimental: true,
  },
];

const EFFORT_LABEL: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

// --- Nodes (with pricing column + relative session-cost scale) ---

type NodeKind = 'terminal' | 'browser' | 'desktop';

interface NodeOption {
  id: string;
  kind: NodeKind;
  name: string;
  dotVariant: 'success' | 'accent';
  dotLabel: string;
  specs: string;
  price: string;
  // 0-5 lit "$" glyphs — relative session cost at current usage.
  costLit: number;
  lockedBy?: string;
}

const NODE_ICON: Record<NodeKind, typeof TerminalIcon> = {
  terminal: TerminalIcon,
  browser: AppWindowIcon,
  desktop: MonitorIcon,
};

const NODE_OPTIONS: NodeOption[] = [
  {
    id: 'cli-mac-studio',
    kind: 'terminal',
    name: 'cli:mac-studio',
    dotVariant: 'success',
    dotLabel: 'Online',
    specs: '12 vCPU · 64 GB',
    price: 'Included',
    costLit: 1,
  },
  {
    id: 'cli-devbox-02',
    kind: 'terminal',
    name: 'cli:devbox-02',
    dotVariant: 'success',
    dotLabel: 'Online',
    specs: '8 vCPU · 32 GB',
    price: 'Included',
    costLit: 1,
  },
  {
    id: 'browser-chrome-work',
    kind: 'browser',
    name: 'browser:chrome-work',
    dotVariant: 'success',
    dotLabel: 'Online',
    specs: 'Tab bridge · v2.4',
    price: 'Included',
    costLit: 1,
  },
  {
    id: 'sandbox-burst-m',
    kind: 'desktop',
    name: 'sandbox:burst-m',
    dotVariant: 'accent',
    dotLabel: 'Provisioned',
    specs: '8 vCPU · 32 GB',
    price: '$0.42/hr',
    costLit: 3,
  },
  {
    id: 'sandbox-burst-xl',
    kind: 'desktop',
    name: 'sandbox:burst-xl',
    dotVariant: 'success',
    dotLabel: 'Online',
    specs: '16 vCPU · 128 GB',
    price: '$1.10/hr',
    costLit: 4,
    lockedBy: 'perf-triage',
  },
];

// --- Context meter (sums to 32,000 of 200,000 tokens = 16%) ---

const CONTEXT_WINDOW = 200000;
const CONTEXT_USED = 32000;
const CONTEXT_USED_PCT = 16;
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
    label: 'Context files',
    tokens: 8200,
    display: '8.2K',
    variant: 'success',
  },
  {
    id: 'skills',
    label: 'Skills',
    tokens: 3100,
    display: '3.1K',
    variant: 'warning',
  },
  {
    id: 'tools',
    label: 'Tool results',
    tokens: 4600,
    display: '4.6K',
    variant: 'error',
  },
  {
    id: 'messages',
    label: 'Messages',
    tokens: 6700,
    display: '6.7K',
    variant: 'accent',
  },
];

// --- Queued follow-ups ---

type QueuedStatus = 'queued' | 'sending' | 'failed';

interface QueuedFollowUp {
  id: string;
  text: string;
  status: QueuedStatus;
  // Stale-queue nudge, only on old queued items.
  staleHint?: string;
}

const INITIAL_QUEUE: QueuedFollowUp[] = [
  {
    id: 'q-1',
    text: 'After the deploy, run the smoke suite against staging',
    status: 'queued',
    staleHint: 'Queued 5m ago — send now?',
  },
  {
    id: 'q-2',
    text: 'Post the pre-flight checklist to #release-ops',
    status: 'sending',
  },
  {
    id: 'q-3',
    text: 'Attach the rollback runbook to this session',
    status: 'failed',
  },
];

// --- Attachments ---

type AttachmentKind = 'pdf' | 'image' | 'log';

interface Attachment {
  id: string;
  kind: AttachmentKind;
  name: string;
  meta: string;
  hasError: boolean;
}

const ATTACHMENT_ICON: Record<AttachmentKind, typeof FileTextIcon> = {
  pdf: FileTextIcon,
  image: ImageIcon,
  log: ScrollTextIcon,
};

const INITIAL_ATTACHMENTS: Attachment[] = [
  {
    id: 'a-1',
    kind: 'pdf',
    name: 'load-test-plan.pdf',
    meta: 'PDF · 1.2 MB',
    hasError: false,
  },
  {
    id: 'a-2',
    kind: 'image',
    name: 'latency-heatmap.png',
    meta: 'PNG · 640 KB',
    hasError: false,
  },
  {
    id: 'a-3',
    kind: 'log',
    name: 'gateway-canary.log',
    meta: 'LOG · 4.8 MB',
    hasError: true,
  },
];

// --- Slash commands ---

interface SlashCommand {
  id: string;
  name: string;
  description: string;
  isSkill: boolean;
}

interface SlashGroup {
  id: string;
  label: string;
  commands: SlashCommand[];
}

const SLASH_GROUPS: SlashGroup[] = [
  {
    id: 'commands',
    label: 'Commands',
    commands: [
      {
        id: 'help',
        name: '/help',
        description: 'List every command and its scope',
        isSkill: false,
      },
      {
        id: 'compact',
        name: '/compact',
        description: 'Summarize older turns to reclaim context',
        isSkill: false,
      },
    ],
  },
  {
    id: 'model',
    label: 'Model',
    commands: [
      {
        id: 'model',
        name: '/model',
        description: 'Switch model or reasoning effort',
        isSkill: false,
      },
    ],
  },
  {
    id: 'session',
    label: 'Session',
    commands: [
      {
        id: 'fork',
        name: '/fork',
        description: 'Branch this chat from the current turn',
        isSkill: false,
      },
      {
        id: 'aside',
        name: '/aside',
        description: 'Side question with full context, kept out of the thread',
        isSkill: false,
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    commands: [
      {
        id: 'stop',
        name: '/stop',
        description: 'Interrupt the running tool call',
        isSkill: false,
      },
      {
        id: 'triage',
        name: '/triage',
        description: 'Run the incident-triage playbook',
        isSkill: true,
      },
    ],
  },
];

// The keyboard-active slash row (visible focus ring in the open menu).
const SLASH_ACTIVE_ID = 'compact';

// ============= HELPERS =============

/**
 * The demo stage is narrower than the viewport, so viewport media queries
 * never fire there — measure the page's own width instead.
 */
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

/** $-scale glyph row: lit "$" glyphs out of five, remainder dimmed "◦". */
function CostScale({lit, name}: {lit: number; name: string}) {
  const clamped = Math.max(0, Math.min(5, lit));
  return (
    <Text
      type="code"
      size="sm"
      color="secondary"
      aria-label={`Relative session cost for ${name}: ${clamped} of 5`}>
      <span>{'$'.repeat(clamped)}</span>
      <span style={styles.costDim} aria-hidden>
        {'◦'.repeat(5 - clamped)}
      </span>
    </Text>
  );
}

// ============= QUEUED FOLLOW-UPS =============

function QueuedFollowUpRow({
  item,
  isCompact,
  onSend,
  onRetry,
  onDelete,
}: {
  item: QueuedFollowUp;
  isCompact: boolean;
  onSend: (id: string) => void;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isFailed = item.status === 'failed';
  const isSending = item.status === 'sending';
  return (
    <HStack gap={2} vAlign="center" style={styles.queuedRow}>
      <Icon icon={CornerDownRightIcon} size="sm" color="secondary" />
      <StackItem size="fill" style={styles.queuedText}>
        <Text maxLines={1}>{item.text}</Text>
      </StackItem>
      {!isCompact && item.staleHint != null && (
        <Text type="supporting" style={styles.staleHint}>
          {item.staleHint}
        </Text>
      )}
      {isSending && <Spinner size="sm" aria-label="Sending follow-up" />}
      <Badge
        label={
          isFailed ? 'Failed' : isSending ? 'Sending' : 'Queued'
        }
        variant={isFailed ? 'error' : isSending ? 'info' : 'neutral'}
      />
      <IconButton
        label={
          isFailed ? `Retry: ${item.text}` : `Send now: ${item.text}`
        }
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
        onClick={() => (isFailed ? onRetry(item.id) : onSend(item.id))}
      />
      <IconButton
        label={`Delete from queue: ${item.text}`}
        tooltip="Delete"
        icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={() => onDelete(item.id)}
      />
    </HStack>
  );
}

// ============= ATTACHMENT CHIPS =============

function AttachmentChip({
  item,
  onRetry,
  onRemove,
}: {
  item: Attachment;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <HStack
      gap={2}
      vAlign="center"
      style={
        item.hasError ? {...styles.chip, ...styles.chipError} : styles.chip
      }>
      <Icon
        icon={ATTACHMENT_ICON[item.kind]}
        size="sm"
        color={item.hasError ? 'error' : 'secondary'}
      />
      <div style={styles.chipName}>
        <Text type="supporting" maxLines={1}>
          {item.name}
        </Text>
      </div>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {item.meta}
      </Text>
      {item.hasError && <Badge label="Upload failed" variant="error" />}
      {item.hasError && (
        <IconButton
          label={`Retry upload: ${item.name}`}
          tooltip="Retry upload"
          icon={<Icon icon={RefreshCwIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          onClick={() => onRetry(item.id)}
        />
      )}
      <IconButton
        label={`Remove attachment: ${item.name}`}
        tooltip="Remove"
        icon={<Icon icon={XIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
      />
    </HStack>
  );
}

// ============= PAGE =============

export default function AiChatComposerSuiteTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;

  const [draft, setDraft] = useState('');
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [attachments, setAttachments] = useState(INITIAL_ATTACHMENTS);

  // Slash command menu renders open above the field on load.
  const [isSlashOpen, setIsSlashOpen] = useState(true);
  const [activeCommand, setActiveCommand] = useState<string | null>(
    '/compact',
  );

  // Model selector.
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [modelId, setModelId] = useState('relay-ultra');
  const [effort, setEffort] = useState('high');
  const [hasExtendedThinking, setHasExtendedThinking] = useState(true);

  // Node selector.
  const [isNodeOpen, setIsNodeOpen] = useState(false);
  const [nodeId, setNodeId] = useState<string | null>(null);

  const [isForceStopOpen, setIsForceStopOpen] = useState(false);

  const selectedModel =
    MODEL_OPTIONS.find(option => option.id === modelId) ?? MODEL_OPTIONS[0];
  const selectedNode = NODE_OPTIONS.find(option => option.id === nodeId);

  const sendQueued = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };
  const retryQueued = (id: string) => {
    setQueue(prev =>
      prev.map(item =>
        item.id === id ? {...item, status: 'sending' as const} : item,
      ),
    );
  };
  const deleteQueued = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const retryAttachment = (id: string) => {
    setAttachments(prev =>
      prev.map(item => (item.id === id ? {...item, hasError: false} : item)),
    );
  };
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(item => item.id !== id));
  };

  // Sending clears the draft, the slash chip, and clean attachments.
  const sendDraft = () => {
    setDraft('');
    setActiveCommand(null);
    setIsSlashOpen(false);
  };

  const pickSlashCommand = (name: string) => {
    setActiveCommand(name);
    setIsSlashOpen(false);
  };

  // --- Slash command menu (rendered open above the field) ---

  const slashMenu = (
    <div style={styles.popoverBody}>
      <VStack gap={2}>
        {SLASH_GROUPS.map(group => (
          <VStack key={group.id} gap={1}>
            <span style={styles.eyebrow}>{group.label}</span>
            {group.commands.map(command => (
              <Item
                key={command.id}
                density="compact"
                style={
                  command.id === SLASH_ACTIVE_ID
                    ? styles.slashActive
                    : undefined
                }
                startContent={
                  <Icon icon={SlashIcon} size="sm" color="secondary" />
                }
                label={
                  <HStack gap={2} vAlign="center">
                    <Text type="code" size="sm">
                      {command.name}
                    </Text>
                    {command.isSkill && (
                      <Badge label="Skill" variant="green" />
                    )}
                  </HStack>
                }
                description={command.description}
                onClick={() => pickSlashCommand(command.name)}
              />
            ))}
          </VStack>
        ))}
        <Divider />
        <Text type="supporting" color="secondary">
          Type / in the field to filter commands
        </Text>
      </VStack>
    </div>
  );

  // --- Model selector panel ---

  const modelPanel = (
    <div style={styles.popoverBody}>
      <VStack gap={2}>
        <span style={styles.eyebrow}>Model</span>
        {MODEL_OPTIONS.map(option => (
          <Item
            key={option.id}
            density="compact"
            startContent={
              <Icon icon={SparklesIcon} size="sm" color="secondary" />
            }
            label={
              <HStack gap={2} vAlign="center">
                <Text>{option.name}</Text>
                {option.isExperimental && (
                  <Badge label="Experimental" variant="warning" />
                )}
              </HStack>
            }
            description={option.description}
            endContent={
              option.id === modelId ? (
                <Icon icon={CheckIcon} size="sm" color="accent" />
              ) : undefined
            }
            onClick={() => setModelId(option.id)}
          />
        ))}
        <Divider />
        <HStack gap={2} vAlign="center">
          <span style={styles.eyebrow}>Reasoning effort</span>
          <span style={styles.defaultDot} aria-hidden />
          <Text type="supporting" color="secondary">
            High is your default
          </Text>
        </HStack>
        <SegmentedControl
          value={effort}
          onChange={setEffort}
          label="Reasoning effort"
          size="sm"
          layout="fill">
          <SegmentedControlItem value="low" label="Low" />
          <SegmentedControlItem value="medium" label="Medium" />
          <SegmentedControlItem value="high" label="High" />
        </SegmentedControl>
        <Divider />
        <span style={styles.eyebrow}>Extended thinking</span>
        <Switch
          label="Extended thinking"
          isLabelHidden
          description="Think longer before replying — slower, better plans"
          value={hasExtendedThinking}
          onChange={setHasExtendedThinking}
          labelSpacing="spread"
          width="100%"
        />
        <Divider />
        <HStack gap={2}>
          <StackItem size="fill" />
          <Button
            label="Done"
            size="sm"
            onClick={() => setIsModelOpen(false)}
          />
        </HStack>
      </VStack>
    </div>
  );

  // --- Node selector panel (pricing column + $-scale) ---

  const nodePanel = (
    <div style={styles.popoverBody}>
      <VStack gap={2}>
        <VStack gap={1}>
          <Text type="label">Node lock</Text>
          <Text type="supporting" color="secondary">
            Pin this session&apos;s tool calls to one node
          </Text>
        </VStack>
        <Item
          density="compact"
          startContent={<Icon icon={GlobeIcon} size="sm" color="secondary" />}
          label="All nodes"
          description="Assistant picks the best node per tool call"
          endContent={
            nodeId == null ? (
              <Icon icon={CheckIcon} size="sm" color="accent" />
            ) : undefined
          }
          onClick={() => {
            setNodeId(null);
            setIsNodeOpen(false);
          }}
        />
        <Divider />
        {NODE_OPTIONS.map(node => {
          const isLocked = node.lockedBy != null;
          return (
            <Item
              key={node.id}
              density="compact"
              startContent={
                <Icon
                  icon={NODE_ICON[node.kind]}
                  size="sm"
                  color={isLocked ? 'disabled' : 'secondary'}
                />
              }
              label={
                <HStack gap={2} vAlign="center">
                  <Text type="code" size="sm">
                    {node.name}
                  </Text>
                  <StatusDot
                    variant={node.dotVariant}
                    label={node.dotLabel}
                  />
                  {isLocked && (
                    <Icon icon={LockIcon} size="sm" color="warning" />
                  )}
                </HStack>
              }
              description={
                isLocked ? (
                  <span style={styles.lockNote}>
                    {node.specs} · Locked by session: {node.lockedBy}
                  </span>
                ) : (
                  node.specs
                )
              }
              endContent={
                <div style={styles.nodePriceCell}>
                  <VStack gap={0}>
                    <Text
                      type="supporting"
                      color="secondary"
                      hasTabularNumbers>
                      {node.price}
                    </Text>
                    <CostScale lit={node.costLit} name={node.name} />
                  </VStack>
                </div>
              }
              onClick={
                isLocked
                  ? undefined
                  : () => {
                      setNodeId(node.id);
                      setIsNodeOpen(false);
                    }
              }
            />
          );
        })}
        <Divider />
        <Text type="supporting" color="secondary">
          $-scale is relative session cost · stale locks clear after 20 min
        </Text>
      </VStack>
    </div>
  );

  // --- Context meter breakdown ---

  const contextBreakdown = (
    <div style={styles.popoverBody}>
      <VStack gap={3}>
        <VStack gap={1}>
          <Text type="label">Context window</Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            32,000 of 200,000 tokens · compaction at 70%
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
          108,000 tokens free before auto-compaction
        </Text>
      </VStack>
    </div>
  );

  // --- Composer suite ---

  const composer = (
    <VStack gap={2} style={styles.composerArea}>
      <div style={styles.composerCard}>
        <VStack gap={3}>
          {/* TOP: queued follow-up rows */}
          {queue.length > 0 && (
            <VStack gap={1}>
              <span style={styles.eyebrow}>Queued follow-ups</span>
              {queue.map(item => (
                <QueuedFollowUpRow
                  key={item.id}
                  item={item}
                  isCompact={isCompact}
                  onSend={sendQueued}
                  onRetry={retryQueued}
                  onDelete={deleteQueued}
                />
              ))}
            </VStack>
          )}

          {/* Attachment chips */}
          {attachments.length > 0 && (
            <HStack gap={1} style={styles.chipWrap}>
              {attachments.map(item => (
                <AttachmentChip
                  key={item.id}
                  item={item}
                  onRetry={retryAttachment}
                  onRemove={removeAttachment}
                />
              ))}
            </HStack>
          )}

          <Divider />

          {/* Active slash chip floating above the field; the grouped
              command menu Popover renders open above it. */}
          <HStack gap={1} vAlign="center">
            <Popover
              label="Slash commands"
              placement="above"
              alignment="start"
              width={400}
              isOpen={isSlashOpen}
              onOpenChange={setIsSlashOpen}
              content={slashMenu}>
              {activeCommand != null ? (
                <Button
                  label={activeCommand}
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={SlashIcon} size="sm" color="accent" />}
                />
              ) : (
                <IconButton
                  label="Open slash commands"
                  tooltip="Slash commands"
                  icon={<Icon icon={SlashIcon} size="sm" color="inherit" />}
                  variant="ghost"
                  size="sm"
                />
              )}
            </Popover>
            {activeCommand != null && (
              <IconButton
                label={`Clear command ${activeCommand}`}
                tooltip="Clear command"
                icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => setActiveCommand(null)}
              />
            )}
            {activeCommand != null && (
              <Text type="supporting" color="secondary">
                Command active — runs on send
              </Text>
            )}
          </HStack>

          {/* MIDDLE: the field */}
          <TextArea
            label={`Message ${ASSISTANT_NAME}`}
            isLabelHidden
            rows={3}
            placeholder={`Message ${ASSISTANT_NAME} — type / for commands…`}
            value={draft}
            onChange={setDraft}
          />

          {/* BELOW: the control row */}
          <HStack gap={1} vAlign="center" style={styles.controlRow}>
            <DropdownMenu
              button={{
                label: 'Attach',
                variant: 'ghost',
                size: 'sm',
                isIconOnly: true,
                icon: <Icon icon={PaperclipIcon} size="sm" color="inherit" />,
              }}
              hasChevron={false}
              items={[
                {label: 'Upload file', onClick: () => {}},
                {label: 'Paste from clipboard', onClick: () => {}},
                {label: 'Capture screenshot', onClick: () => {}},
              ]}
            />
            <IconButton
              label="Dictate a message"
              tooltip="Dictate"
              icon={<Icon icon={MicIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => {}}
            />
            <Popover
              label="Model selector"
              placement="above"
              alignment="start"
              width={320}
              isOpen={isModelOpen}
              onOpenChange={setIsModelOpen}
              content={modelPanel}>
              <Button
                label={`${selectedModel.name} (${EFFORT_LABEL[effort] ?? 'High'})`}
                variant="ghost"
                size="sm"
                icon={<Icon icon={SparklesIcon} size="sm" color="inherit" />}
                endContent={
                  <Icon icon={ChevronDownIcon} size="sm" color="secondary" />
                }
              />
            </Popover>
            <Popover
              label="Node selector"
              placement="above"
              alignment="start"
              width={380}
              isOpen={isNodeOpen}
              onOpenChange={setIsNodeOpen}
              content={nodePanel}>
              <Button
                label={selectedNode?.name ?? 'All nodes'}
                variant="ghost"
                size="sm"
                icon={<Icon icon={GlobeIcon} size="sm" color="inherit" />}
                endContent={
                  <Icon icon={ChevronDownIcon} size="sm" color="secondary" />
                }
              />
            </Popover>
            <StackItem size="fill" />
            <Popover
              label="Context window breakdown"
              placement="above"
              alignment="end"
              width={320}
              content={contextBreakdown}>
              <HStack gap={1} vAlign="center">
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
                  label={`${CONTEXT_USED_PCT}%`}
                  variant="ghost"
                  size="sm"
                />
              </HStack>
            </Popover>
            <Button label="Stop" variant="secondary" size="sm" onClick={() => {}} />
            <Button
              label="Force stop"
              variant="destructive"
              size="sm"
              onClick={() => setIsForceStopOpen(true)}
            />
            <IconButton
              label={
                activeCommand != null
                  ? `Send with ${activeCommand}`
                  : 'Send message'
              }
              tooltip="Send"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              variant="primary"
              size="sm"
              style={styles.roundSend}
              onClick={sendDraft}
            />
            <DropdownMenu
              button={{
                label: 'Send options',
                variant: 'ghost',
                size: 'sm',
                isIconOnly: true,
                icon: (
                  <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                ),
              }}
              hasChevron={false}
              placement="above"
              items={[
                {label: 'Send', onClick: sendDraft},
                {label: 'Send in Fork', onClick: sendDraft},
              ]}
            />
          </HStack>
        </VStack>
      </div>

      {/* Kbd hint row */}
      <HStack gap={2} vAlign="center" style={styles.kbdRow}>
        <Kbd keys="enter" />
        <Text type="supporting" color="secondary">
          to send
        </Text>
        <Text type="supporting" color="secondary">
          ·
        </Text>
        <Kbd keys="shift+enter" />
        <Text type="supporting" color="secondary">
          newline
        </Text>
        <Text type="supporting" color="secondary">
          ·
        </Text>
        <Kbd keys="mod+enter" />
        <Text type="supporting" color="secondary">
          queue
        </Text>
      </HStack>

      <AlertDialog
        isOpen={isForceStopOpen}
        onOpenChange={setIsForceStopOpen}
        title="Force stop the agent?"
        description="Kills the running tool call immediately. Partial edits left in the sandbox are not rolled back."
        actionLabel="Force stop"
        onAction={() => setIsForceStopOpen(false)}
      />
    </VStack>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>{SESSION_TITLE}</Heading>
                  <StatusDot variant="success" label="Agent ready" />
                  {!isCompact && (
                    <Text type="supporting" color="secondary">
                      workspace: release-ops
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <Badge label="Node: flexible" variant="neutral" />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.chatColumn}>
              <ChatLayout composer={composer}>
                <ChatMessageList density="balanced">
                  <ChatSystemMessage variant="divider">
                    Monday, July 6
                  </ChatSystemMessage>
                  <ChatSystemMessage>
                    {ASSISTANT_NAME} can run commands on your nodes and in
                    metered sandboxes.
                  </ChatSystemMessage>

                  {/* User: kick off deploy prep. */}
                  <ChatMessage sender="user">
                    <ChatMessageBubble
                      metadata={
                        <ChatMessageMetadata
                          timestamp={
                            <Timestamp
                              value="2026-07-06T13:42:00"
                              format="time"
                            />
                          }
                        />
                      }>
                      We ship the gateway-api staging deploy at 3pm. Draft the
                      pre-flight checklist and keep an eye on the load-test
                      artifacts I&apos;m attaching.
                    </ChatMessageBubble>
                  </ChatMessage>

                  {/* Assistant: checklist drafted. */}
                  <ChatMessage
                    sender="assistant"
                    avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                    <ChatMessageBubble name={ASSISTANT_NAME}>
                      Checklist drafted — 9 items, 2 blocked on the pending
                      schema migration. I&apos;ll re-check migration status at
                      2:30pm and flag anything that could slip the window.
                    </ChatMessageBubble>
                    <ChatMessageMetadata
                      timestamp={
                        <Timestamp value="2026-07-06T13:44:20" format="time" />
                      }
                    />
                  </ChatMessage>
                </ChatMessageList>
              </ChatLayout>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
