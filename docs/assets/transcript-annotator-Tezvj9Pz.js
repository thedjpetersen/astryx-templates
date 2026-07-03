var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one finished agent session with six
 *   transcript messages covering seven block kinds — text, tool_call,
 *   tool_result, steering, compaction, attachment, error — plus a 15-item
 *   failure-category vocabulary and a pre-filled annotation)
 * @output Human-in-the-loop eval labeling surface: header with a back Link,
 *   session title, completion StatusDot, and a MetadataList of session
 *   facts; left, a scrolling forensic transcript where each message Card is
 *   role-tinted (user blue, assistant neutral) with a meta line
 *   ("assistant · sonnet-4-5 · 3.2s · 1,847 tok") and per-block renderers —
 *   mono tool_call headers with JSON-input CodeBlocks, red-tinted error
 *   tool_results, purple steering interrupts, a muted compaction row,
 *   attachment Token chips, and a bold-summary error block — behind a
 *   "Load more (27 remaining)" pager; right, a sticky 320px labeling panel
 *   with three tint-on-select label Buttons (golden / failure / neutral), a
 *   skill-tag TextInput with Token chips, a conditional scrollable
 *   failure-category CheckboxList, a notes TextArea, Save/Remove actions,
 *   and a provenance footnote
 * @position Page template; emitted by \`astryx template transcript-annotator\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (back Link,
 * session title + StatusDot, session MetadataList). LayoutContent hosts the
 * transcript stack (max width 880, centered) as the only flexible, scrolling
 * region. LayoutPanel end 320 is the always-on labeling panel; it scrolls
 * internally so the category checklist never pushes Save out of reach.
 *
 * Responsive contract:
 * - >1024px: header | transcript (fill, min-width 0) | labeling panel 320.
 *   Transcript and panel scroll independently.
 * - <=1024px: the end panel drops out and the same labeling content renders
 *   below the transcript as a full-width Card in the same scroll region.
 * - <=720px: the header MetadataList hides (title and back link keep the
 *   row); message meta lines wrap instead of truncating.
 *
 * Container policy (forensic-replay archetype): every message is a Card so
 * role tint reads at a glance — blue for user turns, default for assistant,
 * no card at all for the muted compaction row. Block-level color is carried
 * by tinted inline containers (red tool_result/error, purple steering) and
 * a green mono tool_call header, never by page chrome.
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card, type CardVariant} from '@astryxdesign/core/Card';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Code} from '@astryxdesign/core/Code';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  FoldVerticalIcon,
  HandIcon,
  MinusIcon,
  PaperclipIcon,
  TerminalIcon,
  TriangleAlertIcon,
  TrophyIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Transcript column: the only flexible region; min-width 0 so long mono
  // strings truncate instead of widening the page.
  transcriptColumn: {
    width: '100%',
    maxWidth: 880,
    marginInline: 'auto',
    minWidth: 0,
  },
  metaCell: {minWidth: 0},
  // Block tints. Color lives on inline containers, never on page chrome.
  steeringBlock: {
    backgroundColor: 'var(--color-background-purple)',
    border: 'var(--border-width) solid var(--color-border-purple)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  toolResultBlock: {
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  toolResultErrorBlock: {
    backgroundColor: 'var(--color-background-red)',
    border: 'var(--border-width) solid var(--color-border-red)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  errorBlock: {
    backgroundColor: 'var(--color-background-red)',
    borderLeft: '3px solid var(--color-error)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  // Dim details pre inside the error block.
  errorDetails: {whiteSpace: 'pre-wrap', margin: 0},
  monoOutput: {whiteSpace: 'pre-wrap'},
  compactionRow: {paddingBlock: 'var(--spacing-1)'},
  // Labeling panel bits.
  labelButton: {width: '100%', justifyContent: 'flex-start'},
  categoryScroll: {
    maxHeight: 240,
    overflowY: 'auto',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2)',
  },
  tagWrap: {flexWrap: 'wrap'},
};

// Tint-on-select styles for the three label Buttons.
const LABEL_SELECTED_STYLE: Record<LabelValue, CSSProperties> = {
  golden: {
    backgroundColor: 'var(--color-background-yellow)',
    borderColor: 'var(--color-border-yellow)',
    color: 'var(--color-text-yellow)',
  },
  failure: {
    backgroundColor: 'var(--color-background-red)',
    borderColor: 'var(--color-border-red)',
    color: 'var(--color-text-red)',
  },
  neutral: {
    backgroundColor: 'var(--color-background-gray)',
    borderColor: 'var(--color-border-gray)',
    color: 'var(--color-text-gray)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const SESSION_TITLE = 'Debug flaky deploy webhook';
const SESSION_ID = 'ses_9f2c41ab';

type LabelValue = 'golden' | 'failure' | 'neutral';

const LABEL_OPTIONS: Array<{
  value: LabelValue;
  label: string;
  caption: string;
  icon: typeof TrophyIcon;
  iconColor: 'yellow' | 'red' | 'gray';
}> = [
  {
    value: 'golden',
    label: 'Golden',
    caption: 'Exemplary — add to eval set',
    icon: TrophyIcon,
    iconColor: 'yellow',
  },
  {
    value: 'failure',
    label: 'Failure',
    caption: 'Agent went wrong somewhere',
    icon: TriangleAlertIcon,
    iconColor: 'red',
  },
  {
    value: 'neutral',
    label: 'Neutral',
    caption: 'Unremarkable trajectory',
    icon: MinusIcon,
    iconColor: 'gray',
  },
];

// 15-item failure vocabulary; the checklist only renders when the failure
// label is selected.
const FAILURE_CATEGORIES: string[] = [
  'Wrong Tool Choice',
  'Tool Error (Unrecovered)',
  'Hallucinated Output',
  'Ignored User Constraint',
  'Premature Termination',
  'Infinite Loop / Repetition',
  'Context Loss After Compaction',
  'Unsafe Command',
  'Permission / Sandbox Error',
  'Misread Tool Output',
  'Over-broad Edits',
  'Missing Verification',
  'Wrong File / Target',
  'Broken Output Contract',
  'Latency / Timeout',
];

// Seven block kinds; each renders through its own branch in BlockView.
type TranscriptBlock =
  | {kind: 'text'; text: string}
  | {kind: 'tool_call'; tool: string; summary: string; inputsJson: string}
  | {kind: 'tool_result'; output: string; isError: boolean; exitLabel: string}
  | {kind: 'steering'; text: string}
  | {kind: 'compaction'; summary: string}
  | {kind: 'attachment'; fileName: string; sizeLabel: string}
  | {kind: 'error'; summary: string; details: string};

interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  // Meta line pieces, joined with " · " (role first).
  meta: string[];
  tokenLabel?: string;
  tokenTooltip?: string;
  timestamp: string; // fixed ISO timestamp
  blocks: TranscriptBlock[];
}

const ROLE_CARD_VARIANT: Record<'user' | 'assistant', CardVariant> = {
  user: 'blue',
  assistant: 'default',
};

// Six on-screen messages covering all seven block kinds; one tool_result
// error and one compaction row, per the session under review.
const MESSAGES: TranscriptMessage[] = [
  {
    id: 'm-01',
    role: 'user',
    meta: ['user', 'usr_a8f3k2'],
    timestamp: '2026-06-28T09:14:05',
    blocks: [
      {kind: 'attachment', fileName: 'deploy-trace.har', sizeLabel: '2.1 MB'},
      {kind: 'text', text: 'The deploy webhook keeps failing on retries.'},
    ],
  },
  {
    id: 'm-02',
    role: 'assistant',
    meta: ['assistant', 'sonnet-4-5', '3.2s'],
    tokenLabel: '1,847 tok',
    tokenTooltip: '1,214 input · 633 output tokens',
    timestamp: '2026-06-28T09:14:12',
    blocks: [
      {
        kind: 'text',
        text:
          'Retries usually fail for a different reason than the first ' +
          'attempt — let me start with the delivery log on the deploy host.',
      },
      {
        kind: 'tool_call',
        tool: 'bash',
        summary: 'tail -n 50 /var/log/deploy.log',
        inputsJson:
          '{\\n' +
          '  "node": "sandbox-2",\\n' +
          '  "command": "tail -n 50 /var/log/deploy.log"\\n' +
          '}',
      },
    ],
  },
  {
    id: 'm-03',
    role: 'user',
    meta: ['user', 'tool_result', '0.3s'],
    timestamp: '2026-06-28T09:14:16',
    blocks: [
      {
        kind: 'tool_result',
        output: 'tail: cannot open /var/log/deploy.log: Permission denied',
        isError: true,
        exitLabel: 'exit 1',
      },
    ],
  },
  {
    id: 'm-04',
    role: 'user',
    meta: ['user', 'usr_a8f3k2', 'interrupt'],
    timestamp: '2026-06-28T09:15:02',
    blocks: [
      {kind: 'steering', text: 'Focus only on the staging environment.'},
    ],
  },
  {
    id: 'm-05',
    role: 'system',
    meta: ['system'],
    timestamp: '2026-06-28T09:15:04',
    blocks: [{kind: 'compaction', summary: 'Compacted 34 messages into summary'}],
  },
  {
    id: 'm-06',
    role: 'assistant',
    meta: ['assistant', 'sonnet-4-5', '60.2s'],
    tokenLabel: '312 tok',
    tokenTooltip: '9,480 input · 312 output tokens',
    timestamp: '2026-06-28T09:16:10',
    blocks: [
      {
        kind: 'text',
        text:
          'Switching to the staging host and retrying the log read with ' +
          'the deploy service account…',
      },
      {
        kind: 'error',
        summary: 'Stream aborted',
        details:
          'upstream timeout after 60s\\n' +
          'retry budget exhausted (3/3) — request req_demo_7f2a discarded',
      },
    ],
  },
];

// Two earlier messages revealed by "Load more"; the rest stay off-page.
const EARLIER_MESSAGES: TranscriptMessage[] = [
  {
    id: 'em-01',
    role: 'user',
    meta: ['user', 'usr_a8f3k2'],
    timestamp: '2026-06-28T09:11:40',
    blocks: [
      {
        kind: 'text',
        text:
          'Context: we rotated the webhook signing secret on Friday and ' +
          'redeployed the receiver.',
      },
    ],
  },
  {
    id: 'em-02',
    role: 'assistant',
    meta: ['assistant', 'sonnet-4-5', '2.1s'],
    tokenLabel: '904 tok',
    tokenTooltip: '512 input · 392 output tokens',
    timestamp: '2026-06-28T09:11:49',
    blocks: [
      {
        kind: 'text',
        text:
          'Noted — a rotated secret would explain 401s, but retries that ' +
          'fail after a first success point at idempotency handling instead.',
      },
    ],
  },
];

const TOTAL_REMAINING = 27;

// Pre-existing annotation on this session (the state the reviewer opens).
const INITIAL_LABEL: LabelValue = 'failure';
const INITIAL_TAGS = ['devops'];
const INITIAL_CATEGORIES = ['Tool Error (Unrecovered)', 'Premature Termination'];
const INITIAL_NOTES = 'Gave up after first permission error';
const PROVENANCE_AUTO = 'Tagged by dpetersen@acme.dev on 6/29/2026 (auto)';
const PROVENANCE_EDITED = 'Tagged by dpetersen@acme.dev on 6/29/2026 (edited)';

// ============= BLOCK RENDERERS =============

function TextBlock({text}: {text: string}) {
  return <Text>{text}</Text>;
}

/** Mono header (green tool name + command) over a JSON-inputs CodeBlock. */
function ToolCallBlock({
  block,
}: {
  block: Extract<TranscriptBlock, {kind: 'tool_call'}>;
}) {
  return (
    <Collapsible
      defaultIsOpen
      trigger={
        <HStack gap={2} vAlign="center">
          <Icon icon={TerminalIcon} size="sm" color="green" />
          <Code>{block.tool}</Code>
          <StackItem size="fill" style={styles.metaCell}>
            <Text type="code" size="sm" color="secondary" maxLines={1}>
              {block.summary}
            </Text>
          </StackItem>
          <Badge variant="green" label="tool_call" />
        </HStack>
      }>
      <CodeBlock
        code={block.inputsJson}
        language="json"
        size="sm"
        width="100%"
        hasCopyButton={false}
      />
    </Collapsible>
  );
}

/** Red-tinted when the tool errored; muted otherwise. */
function ToolResultBlock({
  block,
}: {
  block: Extract<TranscriptBlock, {kind: 'tool_result'}>;
}) {
  return (
    <div
      style={block.isError ? styles.toolResultErrorBlock : styles.toolResultBlock}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StatusDot
            variant={block.isError ? 'error' : 'success'}
            label={block.isError ? 'Tool call failed' : 'Tool call succeeded'}
          />
          <Text type="label" size="sm">
            tool_result
          </Text>
          <Badge
            variant={block.isError ? 'error' : 'neutral'}
            label={block.exitLabel}
          />
        </HStack>
        <Text type="code" size="sm" style={styles.monoOutput}>
          {block.output}
        </Text>
      </VStack>
    </div>
  );
}

/** Purple-tinted human steering interrupt. */
function SteeringBlock({text}: {text: string}) {
  return (
    <div style={styles.steeringBlock}>
      <HStack gap={2} vAlign="center">
        <Icon icon={HandIcon} size="sm" color="purple" />
        <VStack gap={0}>
          <Text type="label" size="sm">
            Steering interrupt
          </Text>
          <Text size="sm">{text}</Text>
        </VStack>
      </HStack>
    </div>
  );
}

/** Attachment chip; no network assets, just the file name and size. */
function AttachmentBlock({
  block,
}: {
  block: Extract<TranscriptBlock, {kind: 'attachment'}>;
}) {
  return (
    <HStack gap={2}>
      <Token
        label={block.fileName}
        size="sm"
        icon={<Icon icon={PaperclipIcon} size="xsm" color="inherit" />}
        endContent={
          <Text type="supporting" color="secondary">
            {block.sizeLabel}
          </Text>
        }
      />
    </HStack>
  );
}

/** Bold summary + dim details pre for stream-level failures. */
function ErrorBlock({
  block,
}: {
  block: Extract<TranscriptBlock, {kind: 'error'}>;
}) {
  return (
    <div style={styles.errorBlock}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <Icon icon={XIcon} size="sm" color="error" />
          <Text weight="bold" size="sm">
            {block.summary}
          </Text>
        </HStack>
        <Text
          type="code"
          size="sm"
          color="secondary"
          style={styles.errorDetails}>
          {block.details}
        </Text>
      </VStack>
    </div>
  );
}

function BlockView({block}: {block: TranscriptBlock}) {
  switch (block.kind) {
    case 'text':
      return <TextBlock text={block.text} />;
    case 'tool_call':
      return <ToolCallBlock block={block} />;
    case 'tool_result':
      return <ToolResultBlock block={block} />;
    case 'steering':
      return <SteeringBlock text={block.text} />;
    case 'attachment':
      return <AttachmentBlock block={block} />;
    case 'error':
      return <ErrorBlock block={block} />;
    case 'compaction':
      // Rendered by CompactionRow at the message level; unreachable here.
      return null;
  }
}

// ============= MESSAGE RENDERERS =============

/** Muted full-width row, no card chrome: context was folded, not authored. */
function CompactionRow({summary}: {summary: string}) {
  return (
    <HStack gap={3} vAlign="center" style={styles.compactionRow}>
      <StackItem size="fill">
        <Divider />
      </StackItem>
      <Icon icon={FoldVerticalIcon} size="sm" color="secondary" />
      <Text type="supporting" color="secondary">
        {summary}
      </Text>
      <StackItem size="fill">
        <Divider />
      </StackItem>
    </HStack>
  );
}

/** Role-tinted message Card: meta line on top, one renderer per block. */
function MessageCard({
  message,
  isCompact,
}: {
  message: TranscriptMessage;
  isCompact: boolean;
}) {
  if (message.role === 'system') {
    const compaction = message.blocks[0];
    return compaction.kind === 'compaction' ? (
      <CompactionRow summary={compaction.summary} />
    ) : null;
  }

  return (
    <Card variant={ROLE_CARD_VARIANT[message.role]} padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Avatar
            name={message.role === 'assistant' ? 'Sonnet' : 'a8f3k2'}
            size="small"
          />
          <StackItem size="fill" style={styles.metaCell}>
            <Text
              type="supporting"
              color="secondary"
              maxLines={isCompact ? 0 : 1}>
              {message.meta.join(' · ')}
              {message.tokenLabel != null && ' · '}
              {message.tokenLabel != null && (
                <Tooltip content={message.tokenTooltip ?? message.tokenLabel}>
                  <span>{message.tokenLabel}</span>
                </Tooltip>
              )}
            </Text>
          </StackItem>
          <Timestamp
            value={message.timestamp}
            format="time"
            type="supporting"
            color="secondary"
          />
        </HStack>
        {message.blocks.map((block, index) => (
          <BlockView key={\`\${message.id}-b\${index}\`} block={block} />
        ))}
      </VStack>
    </Card>
  );
}

// ============= LABELING PANEL =============

interface AnnotationState {
  label: LabelValue | null;
  tags: string[];
  categories: string[];
  notes: string;
}

function LabelingPanel({
  annotation,
  onChange,
  provenance,
  isDirty,
  onSave,
  onRemove,
}: {
  annotation: AnnotationState;
  onChange: (next: AnnotationState) => void;
  provenance: string;
  isDirty: boolean;
  onSave: () => void;
  onRemove: () => void;
}) {
  const [tagDraft, setTagDraft] = useState('');

  const addTag = () => {
    const tag = tagDraft.trim().toLowerCase();
    if (tag.length === 0 || annotation.tags.includes(tag)) {
      setTagDraft('');
      return;
    }
    onChange({...annotation, tags: [...annotation.tags, tag]});
    setTagDraft('');
  };

  const removeTag = (tag: string) => {
    onChange({...annotation, tags: annotation.tags.filter(t => t !== tag)});
  };

  const isFailure = annotation.label === 'failure';

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Label this session</Heading>
          </StackItem>
          {isDirty && <Badge variant="warning" label="unsaved" />}
        </HStack>
        <Text type="supporting" color="secondary">
          How did the agent do on this trajectory?
        </Text>
      </VStack>

      <VStack gap={2}>
        {LABEL_OPTIONS.map(option => {
          const isSelected = annotation.label === option.value;
          return (
            <Button
              key={option.value}
              label={option.label}
              variant="secondary"
              icon={
                <Icon icon={option.icon} size="sm" color={option.iconColor} />
              }
              endContent={
                <Text type="supporting" color="secondary">
                  {option.caption}
                </Text>
              }
              style={{
                ...styles.labelButton,
                ...(isSelected ? LABEL_SELECTED_STYLE[option.value] : undefined),
              }}
              onClick={() =>
                onChange({
                  ...annotation,
                  label: isSelected ? null : option.value,
                  // Categories only make sense for failures.
                  categories:
                    option.value === 'failure' && !isSelected
                      ? annotation.categories
                      : [],
                })
              }
            />
          );
        })}
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Text type="label">Skill tags</Text>
        <HStack gap={2}>
          <StackItem size="fill">
            <TextInput
              label="Add a skill tag"
              isLabelHidden
              size="sm"
              placeholder="Add a skill tag…"
              value={tagDraft}
              onChange={setTagDraft}
            />
          </StackItem>
          <Button label="Add" variant="secondary" size="sm" onClick={addTag} />
        </HStack>
        {annotation.tags.length > 0 && (
          <HStack gap={1} style={styles.tagWrap}>
            {annotation.tags.map(tag => (
              <Token
                key={tag}
                label={tag}
                size="sm"
                color="blue"
                onRemove={() => removeTag(tag)}
              />
            ))}
          </HStack>
        )}
      </VStack>

      {isFailure && (
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label">Failure categories</Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {annotation.categories.length} of {FAILURE_CATEGORIES.length}
            </Text>
          </HStack>
          <div style={styles.categoryScroll}>
            <CheckboxList
              label="Failure categories"
              isLabelHidden
              density="compact"
              value={annotation.categories}
              onChange={categories => onChange({...annotation, categories})}>
              {FAILURE_CATEGORIES.map(category => (
                <CheckboxListItem
                  key={category}
                  label={category}
                  value={category}
                />
              ))}
            </CheckboxList>
          </div>
        </VStack>
      )}

      <TextArea
        label="Notes"
        rows={3}
        placeholder="What should the eval remember about this run?"
        value={annotation.notes}
        onChange={notes => onChange({...annotation, notes})}
      />

      <HStack gap={2}>
        <StackItem size="fill">
          <Button
            label="Save label"
            style={{width: '100%'}}
            isDisabled={annotation.label == null}
            onClick={onSave}
          />
        </StackItem>
        <Button label="Remove" variant="ghost" onClick={onRemove} />
      </HStack>

      <Collapsible
        trigger={
          <Text type="label" color="secondary">
            Labeling guide
          </Text>
        }>
        <List density="compact">
          <ListItem
            label="Golden"
            description="Exemplary run — promote to the golden eval set."
          />
          <ListItem
            label="Failure"
            description="Pick every category that applies; note the first bad step."
          />
          <ListItem
            label="Neutral"
            description="Fine but unremarkable; keep for volume stats only."
          />
        </List>
      </Collapsible>

      <Divider />

      <Tooltip content="Auto-labels come from the heuristic pass and need human review">
        <Text type="supporting" color="secondary">
          {provenance}
        </Text>
      </Tooltip>
    </VStack>
  );
}

// ============= PAGE =============

export default function TranscriptAnnotatorTemplate() {
  const [annotation, setAnnotation] = useState<AnnotationState>({
    label: INITIAL_LABEL,
    tags: INITIAL_TAGS,
    categories: INITIAL_CATEGORIES,
    notes: INITIAL_NOTES,
  });
  const [provenance, setProvenance] = useState(PROVENANCE_AUTO);
  const [isDirty, setIsDirty] = useState(false);
  const [isEarlierLoaded, setIsEarlierLoaded] = useState(false);

  // Responsive contract: panel docks right >1024px, stacks below otherwise;
  // the header MetadataList hides <=720px.
  const isStacked = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 720px)');

  const updateAnnotation = (next: AnnotationState) => {
    setAnnotation(next);
    setIsDirty(true);
  };

  const saveAnnotation = () => {
    setIsDirty(false);
    setProvenance(PROVENANCE_EDITED);
  };

  const removeAnnotation = () => {
    setAnnotation({label: null, tags: [], categories: [], notes: ''});
    setIsDirty(true);
  };

  const remaining = isEarlierLoaded
    ? TOTAL_REMAINING - EARLIER_MESSAGES.length
    : TOTAL_REMAINING;
  const visibleMessages = isEarlierLoaded
    ? [...EARLIER_MESSAGES, ...MESSAGES]
    : MESSAGES;

  const panel = (
    <LabelingPanel
      annotation={annotation}
      onChange={updateAnnotation}
      provenance={provenance}
      isDirty={isDirty}
      onSave={saveAnnotation}
      onRemove={removeAnnotation}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={4} vAlign="center">
            <StackItem size="fill" style={styles.metaCell}>
              <VStack gap={1}>
                <Link href="#sessions" type="supporting">
                  ‹ Back to sessions
                </Link>
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>{SESSION_TITLE}</Heading>
                  <Badge variant="neutral" label={SESSION_ID} />
                  <StatusDot variant="success" label="Session complete" />
                </HStack>
              </VStack>
            </StackItem>
            {!isCompact && (
              <MetadataList orientation="horizontal">
                <MetadataListItem label="User">usr_a8f3k2</MetadataListItem>
                <MetadataListItem label="Surface">web</MetadataListItem>
                <MetadataListItem label="Model">
                  claude-sonnet-4-5
                </MetadataListItem>
                <MetadataListItem label="Messages">42</MetadataListItem>
              </MetadataList>
            )}
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.transcriptColumn}>
            <VStack gap={3}>
              <HStack hAlign="center">
                {/* Fixtures carry one earlier page; after it loads the pager
                    disables with the server-side remainder still visible. */}
                <Button
                  label={\`Load more (\${remaining} remaining)\`}
                  variant="secondary"
                  size="sm"
                  isDisabled={isEarlierLoaded}
                  onClick={() => setIsEarlierLoaded(true)}
                />
              </HStack>
              {visibleMessages.map(message => (
                <MessageCard
                  key={message.id}
                  message={message}
                  isCompact={isCompact}
                />
              ))}
              {isStacked && (
                <Card padding={4}>
                  {panel}
                </Card>
              )}
            </VStack>
          </div>
        </LayoutContent>
      }
      end={
        isStacked ? undefined : (
          <LayoutPanel width={320} label="Session labeling">
            {panel}
          </LayoutPanel>
        )
      }
    />
  );
}
`;export{e as default};