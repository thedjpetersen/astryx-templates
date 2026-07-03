// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (six composer state specimens, a
 *   four-row queued follow-up tray with Queued/Sending/Steered/Failed
 *   statuses, three @mention candidates with initials avatars and emails,
 *   a '/research' slash chip, a 84,211 / 200,000 context meter, and the
 *   Force-stop AlertDialog copy)
 * @output Component-anatomy gallery that renders one rich agent-chat
 *   composer six times, each frozen in a different state: idle with three
 *   rounded suggestion pills and a context-usage meter; an active
 *   '/research' slash-command chip pinned in the field with a primary tint
 *   ring and a locked classifying placeholder; an open @mention Popover
 *   with initials-Avatar candidate rows and a keyboard highlight; a queued
 *   follow-up tray Card showing all four statuses (Queued with Send button,
 *   Sending with Spinner, Steered, Failed with destructive error line and
 *   retry); a drag-over state with primary ring and drop hint; and a
 *   stop-escalation state where Send has become a destructive Force stop
 *   that opens an inline AlertDialog ('Force stop sandboxes?'). Each
 *   specimen sits under a mono state-id Token caption.
 * @position Page template; emitted by `astryx template composer-state-gallery`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title
 * 'Composer states — 6 specimens', specimen count Badge). LayoutContent
 * hosts a single centered scroll column (maxWidth 720); each specimen is a
 * labeled Section — caption row (mono state-id Token + one-line note) above
 * the composer Card. The mention Popover and the AlertDialog render
 * statically open, anchored to their specimens (controlled isOpen +
 * isInline). This is a state-matrix reference sheet, not a conversation:
 * choose ai-chat-tool-stream when the deliverable is a transcript.
 *
 * Responsive contract:
 * - Specimen column: maxWidth 720, centered; the page scrolls vertically
 *   as one region — header stays fixed chrome.
 * - Specimens keep full width down to mobile; the composer control bar
 *   (attach, mention, hints, send) wraps onto two rows instead of
 *   truncating (flexWrap on the bar, flexShrink 0 on the send slot).
 * - Suggestion pills and attachment chips wrap; the queued tray rows keep
 *   their status Badge and actions and let the message text truncate.
 * - <=720px: every tap control (attach/mention IconButtons, suggestion
 *   pills, Send/Queue/Force stop, and the queue-row Send/Retry/Remove
 *   actions) grows to a 40px hit target via a style override; the "sm"
 *   glyphs and labels are unchanged, so desktop renders identically.
 *
 * Container policy (anatomy-gallery archetype): every specimen is a Card
 * (rounded, soft border) so ring states read against the page background;
 * the queued tray is a second Card stacked above its composer. Accent and
 * error color arrive via ring styles, Badges, and the destructive Button —
 * never via raw hex.
 *
 * Fixture policy: fixed strings only; no clocks, randomness, or network
 * assets. Avatars are initials-only.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Popover} from '@astryxdesign/core/Popover';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Section} from '@astryxdesign/core/Section';
import {Spinner} from '@astryxdesign/core/Spinner';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {
  AtSignIcon,
  OctagonXIcon,
  PaperclipIcon,
  RefreshCwIcon,
  SearchIcon,
  SendIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Single centered scroll column; header is fixed chrome above it.
  column: {
    width: '100%',
    maxWidth: 720,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-4)',
  },
  // Primary tint ring for the slash-command and drag-over specimens.
  accentRing: {
    borderColor: 'var(--color-accent)',
    boxShadow: '0 0 0 3px var(--color-accent-muted)',
  },
  // Control bar wraps to two rows on narrow widths instead of truncating.
  controlBar: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  sendSlot: {flexShrink: 0},
  // <=720px: grow the touch controls to 40px hit targets (the "sm" 28px
  // box is fine for pointers but too small for thumbs); icon glyphs and
  // labels stay "sm" so the specimens read the same, just more padding.
  iconTapTarget: {width: 40, height: 40},
  buttonTapTarget: {height: 40},
  pillWrap: {flexWrap: 'wrap'},
  pill: {borderRadius: 999},
  chipWrap: {flexWrap: 'wrap'},
  meterBar: {width: 96},
  // In-field chip row sits inside the composer, above the TextArea.
  chipRow: {flexWrap: 'wrap'},
  // Mention popover rows; the keyboard-highlighted row gets a muted wash.
  mentionList: {paddingBlock: 'var(--spacing-1)'},
  mentionRow: {
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
    borderRadius: 'var(--radius-container)',
  },
  mentionRowActive: {backgroundColor: 'var(--color-background-muted)'},
  mentionHeader: {
    paddingInline: 'var(--spacing-2)',
    paddingTop: 'var(--spacing-2)',
  },
  mentionFooter: {
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-2)',
  },
  popoverBody: {padding: 'var(--spacing-1)'},
  // Queued tray rows: text truncates, status and actions keep width.
  trayRow: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  trayHeader: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  trayText: {minWidth: 0},
  errorLine: {color: 'var(--color-error)'},
  // Drag-over drop target replaces the field while a drag is in flight.
  dropZone: {
    border: '2px dashed var(--color-accent)',
    borderRadius: 'var(--radius-container)',
    paddingBlock: 'var(--spacing-5)',
    paddingInline: 'var(--spacing-3)',
    backgroundColor: 'var(--color-accent-muted)',
  },
  dropIcon: {color: 'var(--color-accent)'},
};

// ============= DATA =============
// Deterministic fixtures: fixed strings, no clocks, no randomness.

// Context meter shown in the idle specimen: 84,211 of 200,000 tokens.
const CONTEXT_WINDOW = 200000;
const CONTEXT_USED = 84211;
const CONTEXT_USED_PCT = 42;

const IDLE_SUGGESTIONS = [
  {id: 'sg-1', label: 'Summarize the diff so far'},
  {id: 'sg-2', label: 'Draft release notes'},
  {id: 'sg-3', label: 'Explain the failing test'},
];

// Mention candidates; the middle row carries the keyboard highlight.
const MENTION_CANDIDATES = [
  {id: 'joey', handle: 'joey.yu', name: 'Joey Yu', email: 'joey.yu@acme.dev'},
  {id: 'dana', handle: 'dana.r', name: 'Dana Reyes', email: 'dana.r@acme.dev'},
  {
    id: 'priya',
    handle: 'priya.n',
    name: 'Priya Natarajan',
    email: 'priya.n@acme.dev',
  },
];
const MENTION_HIGHLIGHT_INDEX = 1;

type QueueStatus = 'queued' | 'sending' | 'steered' | 'failed';

interface QueueRow {
  id: string;
  text: string;
  status: QueueStatus;
  error?: string;
}

const INITIAL_QUEUE: QueueRow[] = [
  {id: 'q-1', text: 'Also update the README badges', status: 'queued'},
  {id: 'q-2', text: 'Re-run the flaky suite', status: 'sending'},
  {
    id: 'q-3',
    text: 'Attachment follow-up (2 attachments)',
    status: 'steered',
  },
  {
    id: 'q-4',
    text: 'Bump node to 22 in CI',
    status: 'failed',
    error: 'Session was busy — retry',
  },
];

const QUEUE_BADGE: Record<QueueStatus, {label: string; variant: BadgeVariant}> =
  {
    queued: {label: 'Queued', variant: 'neutral'},
    sending: {label: 'Sending', variant: 'info'},
    steered: {label: 'Steered', variant: 'purple'},
    failed: {label: 'Failed', variant: 'error'},
  };

// ============= SHARED COMPOSER BITS =============

/**
 * Specimen wrapper: mono state-id Token + one-line note above the composer
 * Card. Section keeps each specimen a distinct labeled region.
 */
function Specimen({
  stateId,
  note,
  children,
}: {
  stateId: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <Section variant="transparent" padding={0}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Token label={stateId} size="sm" color="gray" />
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        </HStack>
        {children}
      </VStack>
    </Section>
  );
}

/**
 * The composer Card shell. Ring states (slash-command, drag-over) override
 * the border with the accent tint so the frozen state reads at a glance.
 */
function ComposerCard({
  hasAccentRing = false,
  children,
}: {
  hasAccentRing?: boolean;
  children: ReactNode;
}) {
  return (
    <Card padding={3} style={hasAccentRing ? styles.accentRing : undefined}>
      <VStack gap={2}>{children}</VStack>
    </Card>
  );
}

/**
 * Composer control bar: attach + mention on the start side, hints and the
 * send slot on the end side. Wraps to two rows below mobile widths.
 */
function ControlBar({
  mentionSlot,
  startExtras,
  endExtras,
  sendSlot,
}: {
  mentionSlot?: ReactNode;
  startExtras?: ReactNode;
  endExtras?: ReactNode;
  sendSlot: ReactNode;
}) {
  const isCompact = useMediaQuery('(max-width: 720px)');
  const tapTargetStyle = isCompact ? styles.iconTapTarget : undefined;
  return (
    <HStack gap={2} vAlign="center" style={styles.controlBar}>
      <IconButton
        label="Attach file"
        tooltip="Attach file"
        icon={<Icon icon={PaperclipIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTargetStyle}
        onClick={() => {}}
      />
      {mentionSlot ?? (
        <IconButton
          label="Mention a teammate"
          tooltip="Mention"
          icon={<Icon icon={AtSignIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={tapTargetStyle}
          onClick={() => {}}
        />
      )}
      {startExtras}
      <StackItem size="fill" />
      {endExtras}
      <div style={styles.sendSlot}>{sendSlot}</div>
    </HStack>
  );
}

// ============= SPECIMEN 01 · IDLE =============

function IdleSpecimen() {
  const [draft, setDraft] = useState('');
  const [suggestions, setSuggestions] = useState(IDLE_SUGGESTIONS);
  const isCompact = useMediaQuery('(max-width: 720px)');

  return (
    <Specimen
      stateId="01 · idle"
      note="Resting state: suggestion pills, context meter, Enter-to-send.">
      <VStack gap={2}>
        {suggestions.length > 0 && (
          <HStack gap={2} style={styles.pillWrap}>
            {suggestions.map(suggestion => (
              <Button
                key={suggestion.id}
                label={suggestion.label}
                variant="secondary"
                size="sm"
                style={
                  isCompact
                    ? {...styles.pill, ...styles.buttonTapTarget}
                    : styles.pill
                }
                onClick={() =>
                  setSuggestions(prev =>
                    prev.filter(item => item.id !== suggestion.id),
                  )
                }
              />
            ))}
          </HStack>
        )}
        <ComposerCard>
          <TextArea
            label="Message the agent"
            isLabelHidden
            rows={2}
            placeholder="Type a message..."
            value={draft}
            onChange={setDraft}
          />
          <ControlBar
            endExtras={
              <>
                <Tooltip
                  content={`84,211 of 200,000 tokens used (${CONTEXT_USED_PCT}%) · compaction at 85%`}>
                  <HStack gap={2} vAlign="center">
                    <div style={styles.meterBar}>
                      <ProgressBar
                        value={CONTEXT_USED}
                        max={CONTEXT_WINDOW}
                        label="Context window used"
                        isLabelHidden
                      />
                    </div>
                    <Text
                      type="supporting"
                      color="secondary"
                      hasTabularNumbers>
                      {CONTEXT_USED_PCT}%
                    </Text>
                  </HStack>
                </Tooltip>
                <HStack gap={1} vAlign="center">
                  <Kbd keys="enter" />
                  <Text type="supporting" color="secondary">
                    to send
                  </Text>
                  <Kbd keys="mod+enter" />
                  <Text type="supporting" color="secondary">
                    fork
                  </Text>
                </HStack>
              </>
            }
            sendSlot={
              <Button
                label="Send"
                size="sm"
                style={isCompact ? styles.buttonTapTarget : undefined}
                isDisabled={draft.trim().length === 0}
                onClick={() => setDraft('')}
              />
            }
          />
        </ComposerCard>
      </VStack>
    </Specimen>
  );
}

// ============= SPECIMEN 02 · SLASH COMMAND =============

function SlashCommandSpecimen() {
  // Removing the chip cancels the command: ring, lock, and spinner clear.
  const [hasCommand, setHasCommand] = useState(true);
  const [draft, setDraft] = useState('');
  const isCompact = useMediaQuery('(max-width: 720px)');

  return (
    <Specimen
      stateId="02 · slash-command"
      note="'/research' chip pinned in the field; input locked while the workspace classifies.">
      <ComposerCard hasAccentRing={hasCommand}>
        {hasCommand && (
          <HStack gap={2} vAlign="center" style={styles.chipRow}>
            <Token
              label="/research"
              size="sm"
              color="blue"
              icon={
                <Icon icon={SearchIcon} size="sm" color="inherit" />
              }
              onRemove={() => setHasCommand(false)}
            />
            <Text type="supporting" color="secondary">
              Deep-research workspace
            </Text>
          </HStack>
        )}
        <TextArea
          label="Message the agent"
          isLabelHidden
          rows={2}
          placeholder={
            hasCommand ? 'Finding the right workspace…' : 'Type a message...'
          }
          value={draft}
          onChange={setDraft}
          isDisabled={hasCommand}
        />
        <ControlBar
          startExtras={
            hasCommand ? (
              <HStack gap={2} vAlign="center">
                <Spinner size="sm" aria-label="Classifying request" />
                <Text type="supporting" color="secondary">
                  Classifying request…
                </Text>
              </HStack>
            ) : undefined
          }
          sendSlot={
            <Button
              label="Send"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              isDisabled={hasCommand || draft.trim().length === 0}
              onClick={() => setDraft('')}
            />
          }
        />
      </ComposerCard>
    </Specimen>
  );
}

// ============= SPECIMEN 03 · MENTION POPOVER =============

function MentionRow({
  candidate,
  isActive,
}: {
  candidate: (typeof MENTION_CANDIDATES)[number];
  isActive: boolean;
}) {
  return (
    <HStack
      gap={2}
      vAlign="center"
      style={
        isActive
          ? {...styles.mentionRow, ...styles.mentionRowActive}
          : styles.mentionRow
      }>
      <Avatar name={candidate.name} size="xsmall" />
      <StackItem size="fill" style={styles.trayText}>
        <VStack gap={0}>
          <Text size="sm" maxLines={1}>
            {candidate.handle}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {candidate.email}
          </Text>
        </VStack>
      </StackItem>
      {isActive && <Kbd keys="enter" />}
    </HStack>
  );
}

function MentionSpecimen() {
  const [draft, setDraft] = useState('Loop in @');
  const isCompact = useMediaQuery('(max-width: 720px)');

  const mentionPopover = (
    <Popover
      label="Mention a teammate"
      placement="above"
      alignment="start"
      width={288}
      isOpen
      onOpenChange={() => {}}
      hasAutoFocus={false}
      content={
        <div style={styles.popoverBody}>
          <VStack gap={0}>
            <div style={styles.mentionHeader}>
              <Text type="label" size="sm" color="secondary">
                People matching “@”
              </Text>
            </div>
            <VStack gap={0} style={styles.mentionList}>
              {MENTION_CANDIDATES.map((candidate, index) => (
                <MentionRow
                  key={candidate.id}
                  candidate={candidate}
                  isActive={index === MENTION_HIGHLIGHT_INDEX}
                />
              ))}
            </VStack>
            <Divider />
            <HStack gap={1} vAlign="center" style={styles.mentionFooter}>
              <Kbd keys="enter" />
              <Text type="supporting" color="secondary">
                insert
              </Text>
              <StackItem size="fill" />
              <Kbd keys="escape" />
              <Text type="supporting" color="secondary">
                dismiss
              </Text>
            </HStack>
          </VStack>
        </div>
      }>
      <IconButton
        label="Mention a teammate"
        icon={<Icon icon={AtSignIcon} size="sm" color="inherit" />}
        variant="secondary"
        size="sm"
        style={isCompact ? styles.iconTapTarget : undefined}
      />
    </Popover>
  );

  return (
    <Specimen
      stateId="03 · mention"
      note="@mention Popover open above the field; dana.r holds the keyboard highlight.">
      <ComposerCard>
        <TextArea
          label="Message the agent"
          isLabelHidden
          rows={2}
          placeholder="Type a message..."
          value={draft}
          onChange={setDraft}
        />
        <ControlBar
          mentionSlot={mentionPopover}
          sendSlot={
            <Button
              label="Send"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              isDisabled={draft.trim().length === 0}
              onClick={() => setDraft('')}
            />
          }
        />
      </ComposerCard>
    </Specimen>
  );
}

// ============= SPECIMEN 04 · QUEUED FOLLOW-UP TRAY =============

function QueueRowItem({
  row,
  isCompact,
  onSend,
  onRetry,
  onRemove,
}: {
  row: QueueRow;
  isCompact: boolean;
  onSend: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const badge = QUEUE_BADGE[row.status];
  const tapTargetStyle = isCompact ? styles.iconTapTarget : undefined;
  return (
    <HStack gap={2} vAlign="center" style={styles.trayRow}>
      {row.status === 'sending' ? (
        <Spinner size="sm" aria-label="Sending follow-up" />
      ) : null}
      <Badge label={badge.label} variant={badge.variant} />
      <StackItem size="fill" style={styles.trayText}>
        <VStack gap={0}>
          <Text size="sm" maxLines={1}>
            {row.text}
          </Text>
          {row.status === 'failed' && row.error != null && (
            <Text type="supporting" style={styles.errorLine}>
              {row.error}
            </Text>
          )}
          {row.status === 'steered' && (
            <Text type="supporting" color="secondary">
              Merged into the current turn
            </Text>
          )}
        </VStack>
      </StackItem>
      {row.status === 'queued' && (
        <Button
          label="Send"
          variant="secondary"
          size="sm"
          style={isCompact ? styles.buttonTapTarget : undefined}
          icon={
            <Icon icon={SendIcon} size="sm" color="inherit" />
          }
          onClick={() => onSend(row.id)}
        />
      )}
      {row.status === 'failed' && (
        <IconButton
          label={`Retry: ${row.text}`}
          tooltip="Retry"
          icon={<Icon icon={RefreshCwIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={tapTargetStyle}
          onClick={() => onRetry(row.id)}
        />
      )}
      {row.status !== 'sending' && (
        <IconButton
          label={`Remove from queue: ${row.text}`}
          tooltip="Remove"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={tapTargetStyle}
          onClick={() => onRemove(row.id)}
        />
      )}
    </HStack>
  );
}

function QueuedTraySpecimen() {
  const [rows, setRows] = useState(INITIAL_QUEUE);
  const [draft, setDraft] = useState('');
  const isCompact = useMediaQuery('(max-width: 720px)');

  const sendNow = (id: string) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };
  const retry = (id: string) => {
    setRows(prev =>
      prev.map(row =>
        row.id === id ? {...row, status: 'queued' as const, error: undefined} : row,
      ),
    );
  };
  const remove = (id: string) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  return (
    <Specimen
      stateId="04 · queued-tray"
      note="Follow-up tray above the field: Queued, Sending, Steered, and Failed rows.">
      <VStack gap={2}>
        <Card padding={0}>
          <VStack gap={0}>
            <HStack gap={2} vAlign="center" style={styles.trayHeader}>
              <Text type="label" size="sm">
                Follow-up queue
              </Text>
              <Badge label={String(rows.length)} variant="neutral" />
              <StackItem size="fill" />
              <Text type="supporting" color="secondary">
                sends when the agent is free
              </Text>
            </HStack>
            <Divider />
            {rows.map((row, index) => (
              <VStack gap={0} key={row.id}>
                <QueueRowItem
                  row={row}
                  isCompact={isCompact}
                  onSend={sendNow}
                  onRetry={retry}
                  onRemove={remove}
                />
                {index < rows.length - 1 && <Divider />}
              </VStack>
            ))}
          </VStack>
        </Card>
        <ComposerCard>
          <TextArea
            label="Queue a follow-up"
            isLabelHidden
            rows={2}
            placeholder="Ask for follow-up changes"
            value={draft}
            onChange={setDraft}
          />
          <ControlBar
            startExtras={
              <Text type="supporting" color="secondary">
                Agent is running — messages join the queue
              </Text>
            }
            sendSlot={
              <Button
                label="Queue"
                variant="secondary"
                size="sm"
                style={isCompact ? styles.buttonTapTarget : undefined}
                isDisabled={draft.trim().length === 0}
                onClick={() => setDraft('')}
              />
            }
          />
        </ComposerCard>
      </VStack>
    </Specimen>
  );
}

// ============= SPECIMEN 05 · DRAG OVER =============

function DragOverSpecimen() {
  const [pendingFiles, setPendingFiles] = useState(['trace.json']);
  const isCompact = useMediaQuery('(max-width: 720px)');

  return (
    <Specimen
      stateId="05 · drag-over"
      note="File drag in flight: primary ring, drop hint, and a pending 'trace.json' chip.">
      <ComposerCard hasAccentRing>
        {pendingFiles.length > 0 && (
          <HStack gap={1} style={styles.chipWrap}>
            {pendingFiles.map(fileName => (
              <Token
                key={fileName}
                label={fileName}
                size="sm"
                onRemove={() =>
                  setPendingFiles(prev =>
                    prev.filter(name => name !== fileName),
                  )
                }
              />
            ))}
          </HStack>
        )}
        <div style={styles.dropZone}>
          <VStack gap={1} hAlign="center">
            <div style={styles.dropIcon}>
              <Icon icon={UploadIcon} size="lg" color="inherit" />
            </div>
            <Text type="label">Drop files to attach</Text>
            <Text type="supporting" color="secondary">
              Attachments upload when you release · 25 MB max
            </Text>
          </VStack>
        </div>
        <ControlBar
          sendSlot={
            <Button
              label="Send"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              isDisabled
            />
          }
        />
      </ComposerCard>
    </Specimen>
  );
}

// ============= SPECIMEN 06 · STOP ESCALATION =============

function ForceStopSpecimen() {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const isCompact = useMediaQuery('(max-width: 720px)');

  return (
    <Specimen
      stateId="06 · force-stop"
      note="Stop escalated: Send is now a destructive Force stop with an inline AlertDialog.">
      <VStack gap={2}>
        <ComposerCard>
          <Banner
            status="warning"
            title="Stop requested"
            description="The agent is still finishing a sandbox tool call — escalate to force stop if it hangs."
          />
          <TextArea
            label="Message the agent"
            isLabelHidden
            rows={2}
            placeholder="Type a message..."
            value=""
            isDisabled
          />
          <ControlBar
            startExtras={
              <HStack gap={2} vAlign="center">
                <Spinner size="sm" aria-label="Stopping agent" />
                <Text type="supporting" color="secondary">
                  Stopping…
                </Text>
              </HStack>
            }
            sendSlot={
              <Button
                label="Force stop"
                variant="destructive"
                size="sm"
                style={isCompact ? styles.buttonTapTarget : undefined}
                icon={<Icon icon={OctagonXIcon} size="sm" color="inherit" />}
                onClick={() => setIsDialogOpen(true)}
              />
            }
          />
        </ComposerCard>
        <AlertDialog
          isInline
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title="Force stop sandboxes?"
          description="Kills all sandbox VMs attached to this session immediately. Does not stop CLI nodes or dev VMs — those keep running."
          cancelLabel="Keep running"
          actionLabel="Force stop"
          actionVariant="destructive"
          onAction={() => setIsDialogOpen(false)}
        />
      </VStack>
    </Specimen>
  );
}

// ============= PAGE =============

export default function ComposerStateGalleryTemplate() {
  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Composer states — 6 specimens</Heading>
                <Badge label="reference sheet" variant="neutral" />
              </HStack>
            </StackItem>
            <Text type="supporting" color="secondary">
              chat-input anatomy · deterministic fixtures
            </Text>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={6}>
              <IdleSpecimen />
              <SlashCommandSpecimen />
              <MentionSpecimen />
              <QueuedTraySpecimen />
              <DragOverSpecimen />
              <ForceStopSpecimen />
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
