var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (sandbox metadata, invented model
 *   options, verbosity level copy, destroy-list inventory counts, version
 *   string; fixed ISO-adjacent date labels around 2026-07)
 * @output The assistant's gear-menu quick settings rendered as a focused
 *   surface: a slim top bar with product wordmark, session title, and a
 *   sandbox StatusDot; a gear IconButton anchoring an open ~320px Popover
 *   column with Refresh-sandbox and Re-sync-files action rows (tooltip +
 *   result captions), a THEME segmented icon row, a playful 3-level
 *   "Verbosity (team chat)" RadioList, Auto-archive and Auto-dismiss
 *   NumberInput+Switch rows, a Default-model Selector, and a danger zone
 *   whose "Reset sandbox" Button opens a 2-step confirm flow (AlertDialog,
 *   then a Dialog with a destroy bullet list, red "There is no undo" note,
 *   and a type-RESET-to-confirm gate). Footer: version string + Log out.
 * @position Page template; emitted by \`astryx template ai-chat-quick-settings\`
 *
 * Frame: Layout height="fill". LayoutHeader is the slim top bar carrying
 * the gear trigger; LayoutContent hosts only a dimmed, inert transcript
 * stub — the open Popover IS the surface. Unlike ai-workspace-settings-modal
 * (the full settings dialog with a nav aside), this is the fast-path gear
 * menu: sandbox hygiene, notification verbosity, and the reset flow.
 *
 * Responsive contract:
 * - The settings column is a fixed ~320px Popover anchored below-end of the
 *   gear; it never reflows, so this page skips the useElementWidth measurer.
 * - Popover body capped at 72vh with its own vertical scroll; the top bar
 *   and backdrop never scroll.
 * - <=720px the top bar drops the session title and keeps wordmark +
 *   sandbox status + gear (handled by simple flex truncation, not a media
 *   query — the title cell is minWidth 0 and truncates first).
 * - Dialog steps use the component defaults (width 400/440, maxHeight
 *   75vh) and center themselves at any stage width.
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
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Dialog} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Popover} from '@astryxdesign/core/Popover';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {
  FolderSyncIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  RefreshCwIcon,
  SettingsIcon,
  SunIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Top-bar title cell truncates before the fixed chrome does.
  titleCell: {minWidth: 0},
  // The dimmed transcript stub behind the popover: inert scenery only.
  backdrop: {
    height: '100%',
    maxWidth: 720,
    marginInline: 'auto',
    opacity: 0.35,
    pointerEvents: 'none',
    userSelect: 'none',
    paddingTop: 'var(--spacing-4)',
  },
  backdropBubbleUser: {
    alignSelf: 'flex-end',
    maxWidth: 420,
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  backdropBubbleAssistant: {
    alignSelf: 'flex-start',
    maxWidth: 480,
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  // Popover body: the ~320px settings column with its own scroll.
  panelBody: {
    padding: 'var(--spacing-3)',
    maxHeight: '72vh',
    overflowY: 'auto',
  },
  // 11px uppercase tracking-wide section eyebrow.
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  actionRowText: {minWidth: 0},
  numberField: {width: 96},
  dangerNote: {
    color: 'var(--color-error)',
    fontWeight: 600,
  },
  destroyListWrap: {
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-4)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed labels, no clocks, no randomness.

const PRODUCT_NAME = 'Waypoint';
const SESSION_TITLE = 'payments-retry backlog triage';
const VERSION_STRING = 'Waypoint v0.9.2 · build 4821';

const MODEL_OPTIONS = [
  {value: 'aster-5', label: 'aster-5 (default)'},
  {value: 'aster-5-mini', label: 'aster-5-mini'},
  {value: 'corvid-reasoner-2', label: 'corvid-reasoner-2'},
  {value: 'aster-4-legacy', label: 'aster-4 (legacy)'},
];

const THEME_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
  icon: typeof SunIcon;
}> = [
  {value: 'light', label: 'Light', icon: SunIcon},
  {value: 'dark', label: 'Dark', icon: MoonIcon},
  {value: 'system', label: 'System', icon: MonitorIcon},
  {value: 'custom', label: 'Custom', icon: PaletteIcon},
];

const VERBOSITY_LEVELS: ReadonlyArray<{
  value: string;
  label: string;
  description: string;
}> = [
  {
    value: 'level-0',
    label: 'Level 0 — Pure signal',
    description: 'Silence unless you must act. One ping, then nothing.',
  },
  {
    value: 'level-1',
    label: 'Level 1 — Highlights only',
    description: 'Decisions, completions, and anything that went sideways.',
  },
  {
    value: 'level-2',
    label: 'Level 2 — Everything',
    description: 'The full play-by-play. Every tool call, narrated live.',
  },
];

// Inventory shown in the step-2 destroy list. Counts are fixtures.
const DESTROY_ITEMS = [
  'Workspace files — 1,204 files across memory/, notes/, and scripts/',
  'Sandbox backups — 3 snapshots (Jul 6, Jul 9, Jul 12)',
  'Conversations — 86 sessions, including 4 shared with your team',
  'Memory index — 412 entries the assistant learned about your projects',
];

const RESET_CONFIRM_WORD = 'RESET';

type ResetStep = 'closed' | 'confirm' | 'gate';

// ============= SETTINGS ROWS =============

function SectionEyebrow({children}: {children: string}) {
  return <div style={styles.eyebrow}>{children}</div>;
}

// ============= PAGE =============

export default function AiChatQuickSettingsTemplate() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Sandbox action rows.
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [hasResynced, setHasResynced] = useState(false);

  // Preferences.
  const [theme, setTheme] = useState('system');
  const [verbosity, setVerbosity] = useState('level-1');
  const [autoArchiveDays, setAutoArchiveDays] = useState(30);
  const [isAutoArchiveOn, setIsAutoArchiveOn] = useState(true);
  const [autoDismissMinutes, setAutoDismissMinutes] = useState(15);
  const [isAutoDismissOn, setIsAutoDismissOn] = useState(false);
  const [defaultModel, setDefaultModel] = useState('aster-5');

  // Two-step reset flow: AlertDialog first, then the gated Dialog.
  const [resetStep, setResetStep] = useState<ResetStep>('closed');
  const [confirmText, setConfirmText] = useState('');

  const activeTheme = THEME_OPTIONS.find(option => option.value === theme);
  const isResetArmed = confirmText === RESET_CONFIRM_WORD;

  const closeResetFlow = () => {
    setResetStep('closed');
    setConfirmText('');
  };

  const settingsPanel = (
    <div style={styles.panelBody}>
      <VStack gap={3}>
        {/* --- Sandbox action rows --- */}
        <SectionEyebrow>Sandbox</SectionEyebrow>
        <HStack gap={2} vAlign="center">
          <Icon icon={RefreshCwIcon} size="sm" color="secondary" />
          <StackItem size="fill" style={styles.actionRowText}>
            <VStack gap={0}>
              <Text size="sm">Refresh sandbox</Text>
              <Text type="supporting" color="secondary">
                {hasRefreshed
                  ? 'Refreshed — back on a clean runtime'
                  : 'Restart the runtime without losing state'}
              </Text>
            </VStack>
          </StackItem>
          <Tooltip content="Your files and memories are preserved">
            <Button
              label="Refresh"
              variant="secondary"
              size="sm"
              onClick={() => setHasRefreshed(true)}
            />
          </Tooltip>
        </HStack>
        <HStack gap={2} vAlign="center">
          <Icon icon={FolderSyncIcon} size="sm" color="secondary" />
          <StackItem size="fill" style={styles.actionRowText}>
            <VStack gap={0}>
              <Text size="sm">Re-sync files</Text>
              <Text type="supporting" color="secondary">
                {hasResynced
                  ? 'Restored 12 files'
                  : 'Last synced Jul 12 · 09:14'}
              </Text>
            </VStack>
          </StackItem>
          <Button
            label="Re-sync"
            variant="secondary"
            size="sm"
            onClick={() => setHasResynced(true)}
          />
        </HStack>

        <Divider />

        {/* --- Theme --- */}
        <SectionEyebrow>Theme</SectionEyebrow>
        <VStack gap={1}>
          <SegmentedControl
            label="Theme"
            value={theme}
            onChange={setTheme}
            size="sm"
            layout="fill">
            {THEME_OPTIONS.map(option => (
              <SegmentedControlItem
                key={option.value}
                value={option.value}
                label={option.label}
                isLabelHidden
                icon={<Icon icon={option.icon} size="sm" color="inherit" />}
              />
            ))}
          </SegmentedControl>
          <Text type="supporting" color="secondary">
            {activeTheme?.label ?? 'System'}
            {theme === 'system' && ' — follows your OS appearance'}
            {theme === 'custom' && ' — using workspace palette "Lagoon"'}
          </Text>
        </VStack>

        <Divider />

        {/* --- Verbosity --- */}
        <RadioList
          label="Verbosity (team chat)"
          description="How chatty the assistant is in TeamChat threads"
          value={verbosity}
          onChange={setVerbosity}
          size="sm">
          {VERBOSITY_LEVELS.map(level => (
            <RadioListItem
              key={level.value}
              value={level.value}
              label={level.label}
              description={level.description}
            />
          ))}
        </RadioList>

        <Divider />

        {/* --- Housekeeping --- */}
        <SectionEyebrow>Housekeeping</SectionEyebrow>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={styles.actionRowText}>
            <VStack gap={0}>
              <Text size="sm">Auto-archive sessions</Text>
              <Text type="supporting" color="secondary">
                Idle chats move to Archived
              </Text>
            </VStack>
          </StackItem>
          <div style={styles.numberField}>
            <NumberInput
              label="Auto-archive after"
              isLabelHidden
              size="sm"
              value={autoArchiveDays}
              onChange={setAutoArchiveDays}
              min={1}
              max={365}
              isIntegerOnly
              units="days"
              isDisabled={!isAutoArchiveOn}
              disabledMessage="Turn auto-archive on to edit"
            />
          </div>
          <Switch
            label="Auto-archive sessions"
            isLabelHidden
            value={isAutoArchiveOn}
            onChange={setIsAutoArchiveOn}
          />
        </HStack>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={styles.actionRowText}>
            <VStack gap={0}>
              <Text size="sm">Auto-dismiss agents</Text>
              <Text type="supporting" color="secondary">
                Finished sub-agents fold away
              </Text>
            </VStack>
          </StackItem>
          <div style={styles.numberField}>
            <NumberInput
              label="Auto-dismiss after"
              isLabelHidden
              size="sm"
              value={autoDismissMinutes}
              onChange={setAutoDismissMinutes}
              min={1}
              max={240}
              isIntegerOnly
              units="min"
              isDisabled={!isAutoDismissOn}
              disabledMessage="Turn auto-dismiss on to edit"
            />
          </div>
          <Switch
            label="Auto-dismiss agents"
            isLabelHidden
            value={isAutoDismissOn}
            onChange={setIsAutoDismissOn}
          />
        </HStack>

        <Divider />

        {/* --- Default model --- */}
        <Selector
          label="Default model"
          description="New chats start on this model"
          size="sm"
          width="100%"
          options={MODEL_OPTIONS}
          value={defaultModel}
          onChange={setDefaultModel}
        />

        <Divider />

        {/* --- Danger zone --- */}
        <SectionEyebrow>Danger zone</SectionEyebrow>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={styles.actionRowText}>
            <Text type="supporting" color="secondary">
              Wipe this sandbox back to a blank slate
            </Text>
          </StackItem>
          <Button
            label="Reset sandbox"
            variant="destructive"
            size="sm"
            onClick={() => setResetStep('confirm')}
          />
        </HStack>

        <Divider />

        {/* --- Footer --- */}
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={styles.actionRowText}>
            <Text type="supporting" color="secondary">
              {VERSION_STRING}
            </Text>
          </StackItem>
          <Button label="Log out" variant="ghost" size="sm" onClick={() => {}} />
        </HStack>
      </VStack>
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <Text weight="bold">{PRODUCT_NAME}</Text>
            <StackItem size="fill" style={styles.titleCell}>
              <HStack gap={2} vAlign="center">
                <Text color="secondary" maxLines={1}>
                  {SESSION_TITLE}
                </Text>
                <Badge label="Sandbox" variant="neutral" />
              </HStack>
            </StackItem>
            <StatusDot variant="success" label="Sandbox healthy" />
            <Popover
              label="Quick settings"
              placement="below"
              alignment="end"
              width={320}
              isOpen={isPanelOpen}
              onOpenChange={setIsPanelOpen}
              content={settingsPanel}>
              <IconButton
                label="Quick settings"
                tooltip="Quick settings"
                icon={<Icon icon={SettingsIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
              />
            </Popover>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          {/* Dimmed, inert transcript stub — scenery behind the panel. */}
          <div style={styles.backdrop} aria-hidden>
            <VStack gap={3}>
              <div style={styles.backdropBubbleUser}>
                <Text size="sm" color="secondary">
                  The payments-retry queue is backing up again — can you pull
                  the dead-letter counts since Friday?
                </Text>
              </div>
              <div style={styles.backdropBubbleAssistant}>
                <Text size="sm" color="secondary">
                  Pulled the numbers: 4,182 messages parked in the dead-letter
                  queue, 92% of them from the EU shard. Two retry workers have
                  been flapping since the Jul 10 deploy…
                </Text>
              </div>
              <div style={styles.backdropBubbleUser}>
                <Text size="sm" color="secondary">
                  Draft a rollback plan for the EU shard first.
                </Text>
              </div>
            </VStack>
          </div>
        </LayoutContent>
      }>
      {/* Step 1: intent check. */}
      <AlertDialog
        isOpen={resetStep === 'confirm'}
        onOpenChange={open => {
          if (!open) {
            closeResetFlow();
          }
        }}
        title="Reset this sandbox?"
        description="This wipes the whole sandbox — not just the runtime. You will see exactly what gets destroyed before anything happens."
        cancelLabel="Keep sandbox"
        actionLabel="Continue"
        onAction={() => setResetStep('gate')}
      />

      {/* Step 2: destroy manifest + type-to-confirm gate. */}
      <Dialog
        isOpen={resetStep === 'gate'}
        onOpenChange={open => {
          if (!open) {
            closeResetFlow();
          }
        }}
        width={440}
        purpose="form">
        <VStack gap={3}>
          <Heading level={2}>Permanently reset sandbox</Heading>
          <Text type="supporting" color="secondary">
            Resetting destroys everything the assistant has built up in this
            sandbox:
          </Text>
          <div style={styles.destroyListWrap}>
            <List listStyle="disc" density="compact">
              {DESTROY_ITEMS.map(item => (
                <ListItem key={item} label={<Text size="sm">{item}</Text>} />
              ))}
            </List>
          </div>
          <Text size="sm" style={styles.dangerNote}>
            There is no undo. Backups are destroyed along with the sandbox.
          </Text>
          <TextInput
            label={\`Type \${RESET_CONFIRM_WORD} to confirm\`}
            value={confirmText}
            onChange={setConfirmText}
            placeholder={RESET_CONFIRM_WORD}
            status={
              confirmText.length > 0 && !isResetArmed
                ? {type: 'warning', message: \`Type \${RESET_CONFIRM_WORD} in all caps\`}
                : undefined
            }
          />
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" />
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onClick={closeResetFlow}
            />
            <Button
              label="Permanently delete everything"
              variant="destructive"
              size="sm"
              isDisabled={!isResetArmed}
              onClick={closeResetFlow}
            />
          </HStack>
        </VStack>
      </Dialog>
    </Layout>
  );
}
`;export{e as default};