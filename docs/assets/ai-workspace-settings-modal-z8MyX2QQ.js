var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (settings nav groups, push-level
 *   descriptions, subscribed device rows, team-chat emoji presets and
 *   acknowledgment conditions, experiment flags, dimmed backdrop transcript)
 * @output Workspace settings rendered as a large open Dialog over a dimmed
 *   chat: a 240px aside with a "Settings" header, a settings search that
 *   filters the grouped nav (APP / CONNECTIONS / AUTOMATION / INTERFACE),
 *   and a right pane that swaps panels — Notifications in full (push-level
 *   SegmentedControl with per-level descriptions, subscription status +
 *   Test button, removable device rows, and a team-chat acknowledgment
 *   section with emoji ToggleButton presets over per-condition Selectors),
 *   Experiments (checkbox rows with ALPHA/BETA/STABLE Badges), a compact
 *   General panel, and EmptyState stubs for the rest
 * @position Page template; emitted by \`astryx template ai-workspace-settings-modal\`
 *
 * Frame: Layout height="fill" hosts the backdrop chat (slim header with a
 * gear that reopens the dialog, centered ChatMessageList). The Dialog is
 * open by default with padding 0; inside it a fixed-height two-pane flex
 * body — nav aside (borderRight, muted background) and a panel pane whose
 * body scrolls under a pinned panel header.
 *
 * Responsive contract:
 * - Width is measured on the page wrapper with a ResizeObserver
 *   (useElementWidth) — the demo's inline stage never fires viewport media
 *   queries. isCompact = wrapWidth <= 840.
 * - >840px: dialog is 896px wide; the nav is a 240px vertical aside with
 *   uppercase group eyebrows; ack condition rows put label and Selector on
 *   one line.
 * - <=840px: dialog narrows to min(680px, 94vw); the nav collapses to a
 *   horizontally scrolling pill strip under the search input (group
 *   eyebrows drop); ack condition rows stack label above Selector; the
 *   devices "Updated" column hides.
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
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Dialog} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {
  BellIcon,
  BotIcon,
  CableIcon,
  DatabaseIcon,
  FlaskConicalIcon,
  KeyboardIcon,
  LaptopIcon,
  MonitorIcon,
  PaletteIcon,
  SearchIcon,
  SettingsIcon,
  SmartphoneIcon,
  SettingsIcon as GearIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  pageWrap: {height: '100%'},
  chatColumn: {maxWidth: 760, marginInline: 'auto'},
  // Two-pane dialog body: fixed height so both panes scroll independently.
  dialogBody: {
    display: 'flex',
    height: 'min(600px, 76vh)',
  },
  dialogBodyCompact: {
    display: 'flex',
    flexDirection: 'column',
    height: 'min(600px, 76vh)',
  },
  // Nav aside (wide layout).
  aside: {
    width: 240,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-4)',
    borderRight: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    overflowY: 'auto',
  },
  // Compact header block: title row + search + horizontal nav strip.
  compactHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  navStrip: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-1)',
  },
  navStripItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    flexShrink: 0,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
    font: 'inherit',
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--spacing-1) var(--spacing-3)',
    cursor: 'pointer',
  },
  navStripItemActive: {
    backgroundColor: 'var(--color-accent-muted)',
    borderColor: 'var(--color-accent)',
    color: 'var(--color-text-accent)',
  },
  // 10-11px uppercase tracking-wide group eyebrow.
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  navGroup: {display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)'},
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    textAlign: 'left',
    border: 'none',
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    font: 'inherit',
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    cursor: 'pointer',
  },
  navItemActive: {
    backgroundColor: 'var(--color-accent-muted)',
    color: 'var(--color-text-accent)',
    fontWeight: 600,
  },
  // Right pane: pinned header, scrolling body.
  panelPane: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {
    padding: 'var(--spacing-4) var(--spacing-5) var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  panelBody: {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--spacing-5)',
  },
  deviceRow: {paddingBlock: 'var(--spacing-2)'},
  ackRow: {paddingBlock: 'var(--spacing-1)'},
  experimentRow: {paddingBlock: 'var(--spacing-2)'},
  stubWrap: {paddingBlock: 'var(--spacing-8)'},
};

// ============= RESPONSIVE HELPER =============

// The demo's inline stage is narrower than the window, so viewport media
// queries never fire there — measure the page's own width instead.
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
// Deterministic fixtures: fixed dates, no clocks, no randomness.

const ASSISTANT_NAME = 'Beacon Assistant';
const WORKSPACE_NAME = 'Northwind Platform';

type PanelId =
  | 'general'
  | 'appearance'
  | 'storage'
  | 'notifications'
  | 'connections'
  | 'automation'
  | 'subagents'
  | 'shortcuts'
  | 'experiments';

interface NavItemSpec {
  id: PanelId;
  label: string;
  icon: typeof SettingsIcon;
}

interface NavGroupSpec {
  id: string;
  label: string;
  items: NavItemSpec[];
}

const NAV_GROUPS: NavGroupSpec[] = [
  {
    id: 'app',
    label: 'App',
    items: [
      {id: 'general', label: 'General', icon: SettingsIcon},
      {id: 'appearance', label: 'Appearance', icon: PaletteIcon},
      {id: 'storage', label: 'Storage', icon: DatabaseIcon},
      {id: 'notifications', label: 'Notifications', icon: BellIcon},
    ],
  },
  {
    id: 'connections',
    label: 'Connections',
    items: [{id: 'connections', label: 'Team chat & nodes', icon: CableIcon}],
  },
  {
    id: 'automation',
    label: 'Automation',
    items: [
      {id: 'automation', label: 'Automation', icon: ZapIcon},
      {id: 'subagents', label: 'Sub-Agents', icon: BotIcon},
    ],
  },
  {
    id: 'interface',
    label: 'Interface',
    items: [
      {id: 'shortcuts', label: 'Shortcuts', icon: KeyboardIcon},
      {id: 'experiments', label: 'Experiments', icon: FlaskConicalIcon},
    ],
  },
];

const PANEL_SUBTITLES: Record<PanelId, string> = {
  general: 'Assistant identity, language, and startup behavior.',
  appearance: 'Theme, density, and font preferences.',
  storage: 'Workspace files, caches, and retention.',
  notifications: 'Push level, subscribed devices, and team-chat reactions.',
  connections: 'Team chat channels and paired compute nodes.',
  automation: 'Scheduled jobs and lifecycle hooks.',
  subagents: 'Delegation limits and sub-agent defaults.',
  shortcuts: 'Keyboard shortcuts and chords.',
  experiments: 'Early features — flip on at your own risk.',
};

// EmptyState copy for the panels this surface stubs out.
const STUB_PANELS: Partial<
  Record<PanelId, {icon: typeof SettingsIcon; description: string}>
> = {
  appearance: {
    icon: PaletteIcon,
    description:
      'Light, dark, and system themes plus interface density live here.',
  },
  storage: {
    icon: DatabaseIcon,
    description:
      'Workspace files use 412 MB of 5 GB. Cache and retention controls live here.',
  },
  connections: {
    icon: CableIcon,
    description:
      'Link TeamChat channels and pair CLI, browser, or desktop nodes here.',
  },
  automation: {
    icon: ZapIcon,
    description: 'Schedules and lifecycle hooks for this workspace live here.',
  },
  subagents: {
    icon: BotIcon,
    description:
      'Concurrency caps and default models for delegated agents live here.',
  },
  shortcuts: {
    icon: KeyboardIcon,
    description: 'Rebind composer and navigation shortcuts here.',
  },
};

// Push notification levels; the description under the SegmentedControl
// tracks the selection.
type PushLevel = 'off' | 'important' | 'done' | 'all';

const PUSH_LEVELS: Array<{value: PushLevel; label: string; description: string}> =
  [
    {
      value: 'off',
      label: 'Off',
      description: 'Push stays quiet — check in from the app when you want a status.',
    },
    {
      value: 'important',
      label: 'Important',
      description: 'Only pings that need you: approvals, blockers, and failures.',
    },
    {
      value: 'done',
      label: 'Done',
      description: 'Everything in Important, plus a ping when a session finishes.',
    },
    {
      value: 'all',
      label: 'All',
      description: 'Every update, including progress notes while agents work.',
    },
  ];

interface DeviceRow {
  id: string;
  name: string;
  note: string;
  updated: string;
  icon: typeof MonitorIcon;
}

const INITIAL_DEVICES: DeviceRow[] = [
  {
    id: 'dev-1',
    name: 'Chrome · macOS',
    note: 'This browser',
    updated: 'Updated Jul 2',
    icon: MonitorIcon,
  },
  {
    id: 'dev-2',
    name: 'Safari · iPhone',
    note: 'Home screen app',
    updated: 'Updated Jun 27',
    icon: SmartphoneIcon,
  },
  {
    id: 'dev-3',
    name: 'Edge · Windows 11',
    note: 'Work laptop',
    updated: 'Updated May 19',
    icon: LaptopIcon,
  },
];

// Team-chat acknowledgment emoji presets. The ToggleButton row picks which
// presets are available in the per-condition Selectors below it.
type PresetId = 'eyes' | 'gear' | 'check' | 'memo' | 'thumbs' | 'zap';

const EMOJI_PRESETS: Array<{id: PresetId; emoji: string; label: string}> = [
  {id: 'eyes', emoji: '👀', label: 'Eyes'},
  {id: 'gear', emoji: '⚙️', label: 'Gear'},
  {id: 'check', emoji: '✅', label: 'Check'},
  {id: 'memo', emoji: '📝', label: 'Memo'},
  {id: 'thumbs', emoji: '👍', label: 'Thumbs up'},
  {id: 'zap', emoji: '⚡', label: 'Zap'},
];

type AckConditionId = 'new-sessions' | 'continued' | 'busy' | 'done';

const ACK_CONDITIONS: Array<{
  id: AckConditionId;
  label: string;
  description: string;
}> = [
  {
    id: 'new-sessions',
    label: 'New sessions',
    description: 'First reply in a fresh thread',
  },
  {
    id: 'continued',
    label: 'Continued threads',
    description: 'Follow-ups in an existing thread',
  },
  {
    id: 'busy',
    label: 'Busy follow-ups',
    description: 'Messages that arrive while an agent is running',
  },
  {
    id: 'done',
    label: 'Done',
    description: 'When the session wraps up',
  },
];

const INITIAL_ACK_SELECTIONS: Record<AckConditionId, PresetId> = {
  'new-sessions': 'eyes',
  continued: 'gear',
  busy: 'memo',
  done: 'check',
};

// Experiment flags. Amber = alpha, matching the lock/experimental accent.
type ExperimentStage = 'alpha' | 'beta' | 'stable';

const STAGE_BADGE: Record<
  ExperimentStage,
  {label: string; variant: 'warning' | 'info' | 'success'}
> = {
  alpha: {label: 'ALPHA', variant: 'warning'},
  beta: {label: 'BETA', variant: 'info'},
  stable: {label: 'STABLE', variant: 'success'},
};

interface ExperimentSpec {
  id: string;
  name: string;
  stage: ExperimentStage;
  description: string;
}

const EXPERIMENTS: ExperimentSpec[] = [
  {
    id: 'parallel-subagents',
    name: 'Parallel sub-agents',
    stage: 'alpha',
    description: 'Fan a task out to up to 4 workers and merge their results.',
  },
  {
    id: 'artifact-preview',
    name: 'Inline artifact preview',
    stage: 'beta',
    description:
      'Render generated files beside the transcript instead of a download chip.',
  },
  {
    id: 'voice-replies',
    name: 'Voice replies',
    stage: 'alpha',
    description: 'Read assistant turns aloud on paired devices.',
  },
  {
    id: 'auto-titles',
    name: 'Session auto-titles',
    stage: 'stable',
    description: 'Name new sessions from the first exchange.',
  },
  {
    id: 'node-autoprovision',
    name: 'Node auto-provisioning',
    stage: 'beta',
    description: 'Spin up a sandbox node when a task needs one.',
  },
  {
    id: 'compaction-v2',
    name: 'Compaction v2',
    stage: 'alpha',
    description: 'Tighter summaries with per-file token budgets.',
  },
];

const INITIAL_EXPERIMENTS: Record<string, boolean> = {
  'parallel-subagents': false,
  'artifact-preview': true,
  'voice-replies': false,
  'auto-titles': true,
  'node-autoprovision': true,
  'compaction-v2': false,
};

const LANGUAGE_OPTIONS = [
  {value: 'en-US', label: 'English (US)'},
  {value: 'en-GB', label: 'English (UK)'},
  {value: 'de-DE', label: 'Deutsch'},
  {value: 'ja-JP', label: '日本語'},
];

// ============= NAV =============

function GroupEyebrow({children}: {children: string}) {
  return <span style={styles.eyebrow}>{children}</span>;
}

function SettingsNavAside({
  query,
  onQueryChange,
  groups,
  activePanel,
  onSelect,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  groups: NavGroupSpec[];
  activePanel: PanelId;
  onSelect: (id: PanelId) => void;
}) {
  return (
    <div style={styles.aside}>
      <Heading level={2}>Settings</Heading>
      <TextInput
        label="Search settings"
        isLabelHidden
        size="sm"
        startIcon={<Icon icon={SearchIcon} size="sm" />}
        value={query}
        onChange={onQueryChange}
        placeholder="Search settings"
        hasClear
      />
      {groups.length === 0 ? (
        <Text type="supporting" color="secondary">
          No settings match &ldquo;{query.trim()}&rdquo;
        </Text>
      ) : (
        groups.map(group => (
          <div key={group.id} style={styles.navGroup}>
            <GroupEyebrow>{group.label}</GroupEyebrow>
            {group.items.map(item => {
              const isActive = item.id === activePanel;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  style={
                    isActive
                      ? {...styles.navItem, ...styles.navItemActive}
                      : styles.navItem
                  }
                  onClick={() => onSelect(item.id)}>
                  <Icon
                    icon={item.icon}
                    size="sm"
                    color={isActive ? 'accent' : 'secondary'}
                  />
                  {item.label}
                </button>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}

function SettingsNavStrip({
  query,
  onQueryChange,
  groups,
  activePanel,
  onSelect,
  onClose,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  groups: NavGroupSpec[];
  activePanel: PanelId;
  onSelect: (id: PanelId) => void;
  onClose: () => void;
}) {
  const items = groups.flatMap(group => group.items);
  return (
    <div style={styles.compactHead}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={2}>Settings</Heading>
        </StackItem>
        <IconButton
          label="Close settings"
          tooltip="Close"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          onClick={onClose}
        />
      </HStack>
      <TextInput
        label="Search settings"
        isLabelHidden
        size="sm"
        startIcon={<Icon icon={SearchIcon} size="sm" />}
        value={query}
        onChange={onQueryChange}
        placeholder="Search settings"
        hasClear
      />
      {items.length === 0 ? (
        <Text type="supporting" color="secondary">
          No settings match &ldquo;{query.trim()}&rdquo;
        </Text>
      ) : (
        <div style={styles.navStrip}>
          {items.map(item => {
            const isActive = item.id === activePanel;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                style={
                  isActive
                    ? {...styles.navStripItem, ...styles.navStripItemActive}
                    : styles.navStripItem
                }
                onClick={() => onSelect(item.id)}>
                <Icon
                  icon={item.icon}
                  size="sm"
                  color={isActive ? 'accent' : 'secondary'}
                />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============= PANELS =============

function NotificationsPanel({
  isCompact,
  pushLevel,
  onPushLevelChange,
  isTestSent,
  onSendTest,
  devices,
  onRemoveDevice,
  enabledPresets,
  onPresetChange,
  ackSelections,
  onAckChange,
}: {
  isCompact: boolean;
  pushLevel: PushLevel;
  onPushLevelChange: (level: PushLevel) => void;
  isTestSent: boolean;
  onSendTest: () => void;
  devices: DeviceRow[];
  onRemoveDevice: (id: string) => void;
  enabledPresets: ReadonlySet<PresetId>;
  onPresetChange: (id: PresetId, isPressed: boolean) => void;
  ackSelections: Record<AckConditionId, PresetId>;
  onAckChange: (condition: AckConditionId, preset: PresetId) => void;
}) {
  const activeLevel =
    PUSH_LEVELS.find(level => level.value === pushLevel) ?? PUSH_LEVELS[0];
  const isPushOff = pushLevel === 'off';

  const ackOptions = EMOJI_PRESETS.filter(preset =>
    enabledPresets.has(preset.id),
  ).map(preset => ({
    value: preset.id,
    label: \`\${preset.emoji} \${preset.label}\`,
  }));

  return (
    <VStack gap={5}>
      {/* Push level */}
      <VStack gap={2}>
        <GroupEyebrow>Push notifications</GroupEyebrow>
        <SegmentedControl
          label="Push notification level"
          value={pushLevel}
          onChange={value => onPushLevelChange(value as PushLevel)}
          size="sm">
          {PUSH_LEVELS.map(level => (
            <SegmentedControlItem
              key={level.value}
              value={level.value}
              label={level.label}
            />
          ))}
        </SegmentedControl>
        <Text type="supporting" color="secondary">
          {activeLevel.description}
        </Text>
        <HStack gap={2} vAlign="center">
          {isPushOff ? (
            <StatusDot variant="neutral" label="Push off" />
          ) : (
            <StatusDot variant="success" label="Subscribed" />
          )}
          <StackItem size="fill">
            <Text type="supporting">
              {isPushOff
                ? 'Push is off on this browser'
                : 'Subscribed on this browser'}
            </Text>
          </StackItem>
          <Button
            label="Test"
            variant="secondary"
            size="sm"
            isDisabled={isPushOff}
            onClick={onSendTest}
          />
        </HStack>
        {isTestSent && !isPushOff && (
          <Text type="supporting" color="secondary">
            Test notification sent — check this browser.
          </Text>
        )}
      </VStack>

      <Divider />

      {/* Devices */}
      <VStack gap={1}>
        <GroupEyebrow>Devices</GroupEyebrow>
        {devices.length === 0 ? (
          <Text type="supporting" color="secondary">
            No subscribed devices — enable push on a browser to add one.
          </Text>
        ) : (
          devices.map((device, index) => (
            <VStack key={device.id} gap={0}>
              <HStack gap={2} vAlign="center" style={styles.deviceRow}>
                <Icon icon={device.icon} size="sm" color="secondary" />
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text type="body">{device.name}</Text>
                    <Text type="supporting" color="secondary">
                      {device.note}
                    </Text>
                  </VStack>
                </StackItem>
                {!isCompact && (
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {device.updated}
                  </Text>
                )}
                <Button
                  label="Remove"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveDevice(device.id)}
                />
              </HStack>
              {index < devices.length - 1 && <Divider />}
            </VStack>
          ))
        )}
      </VStack>

      <Divider />

      {/* Team-chat acknowledgment */}
      <VStack gap={2}>
        <GroupEyebrow>Team chat acknowledgment</GroupEyebrow>
        <Text type="supporting" color="secondary">
          {ASSISTANT_NAME} reacts to your TeamChat messages so you can see
          progress without opening the app. Pick the presets to use, then map
          each condition to a reaction.
        </Text>
        <HStack gap={1} vAlign="center">
          {EMOJI_PRESETS.map(preset => (
            <ToggleButton
              key={preset.id}
              label={\`\${preset.label} reaction preset\`}
              size="sm"
              isPressed={enabledPresets.has(preset.id)}
              onPressedChange={isPressed => onPresetChange(preset.id, isPressed)}>
              {preset.emoji}
            </ToggleButton>
          ))}
        </HStack>
        <VStack gap={1}>
          {ACK_CONDITIONS.map(condition => {
            const labelBlock = (
              <VStack gap={0}>
                <Text type="body">{condition.label}</Text>
                <Text type="supporting" color="secondary">
                  {condition.description}
                </Text>
              </VStack>
            );
            const selector = (
              <Selector
                label={\`Reaction for \${condition.label}\`}
                isLabelHidden
                size="sm"
                width={isCompact ? '100%' : 176}
                options={ackOptions}
                value={ackSelections[condition.id]}
                onChange={value => onAckChange(condition.id, value as PresetId)}
              />
            );
            return isCompact ? (
              <VStack key={condition.id} gap={1} style={styles.ackRow}>
                {labelBlock}
                {selector}
              </VStack>
            ) : (
              <HStack key={condition.id} gap={3} vAlign="center" style={styles.ackRow}>
                <StackItem size="fill">{labelBlock}</StackItem>
                {selector}
              </HStack>
            );
          })}
        </VStack>
      </VStack>
    </VStack>
  );
}

function ExperimentsPanel({
  flags,
  onFlagChange,
}: {
  flags: Record<string, boolean>;
  onFlagChange: (id: string, value: boolean) => void;
}) {
  return (
    <VStack gap={2}>
      <GroupEyebrow>Early features</GroupEyebrow>
      <Text type="supporting" color="secondary">
        Experiments can change or disappear between releases. Alpha features
        may lose session data.
      </Text>
      <VStack gap={0}>
        {EXPERIMENTS.map((experiment, index) => (
          <VStack key={experiment.id} gap={0}>
            <HStack gap={3} vAlign="start" style={styles.experimentRow}>
              <StackItem size="fill">
                <CheckboxInput
                  label={experiment.name}
                  description={experiment.description}
                  value={flags[experiment.id] ?? false}
                  onChange={checked => onFlagChange(experiment.id, checked)}
                />
              </StackItem>
              <Badge
                label={STAGE_BADGE[experiment.stage].label}
                variant={STAGE_BADGE[experiment.stage].variant}
              />
            </HStack>
            {index < EXPERIMENTS.length - 1 && <Divider />}
          </VStack>
        ))}
      </VStack>
    </VStack>
  );
}

function GeneralPanel({
  assistantLabel,
  onAssistantLabelChange,
  language,
  onLanguageChange,
  reopensLastSession,
  onReopensLastSessionChange,
}: {
  assistantLabel: string;
  onAssistantLabelChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  reopensLastSession: boolean;
  onReopensLastSessionChange: (value: boolean) => void;
}) {
  return (
    <VStack gap={4}>
      <TextInput
        label="Assistant name"
        description="How the assistant signs its messages in this workspace."
        value={assistantLabel}
        onChange={onAssistantLabelChange}
        width={320}
      />
      <Selector
        label="Language"
        options={LANGUAGE_OPTIONS}
        value={language}
        onChange={onLanguageChange}
        width={320}
      />
      <Switch
        label="Reopen last session on launch"
        description="Skip the landing page and jump back into your most recent chat."
        value={reopensLastSession}
        onChange={onReopensLastSessionChange}
      />
    </VStack>
  );
}

function StubPanel({panel}: {panel: PanelId}) {
  const stub = STUB_PANELS[panel];
  const item = NAV_GROUPS.flatMap(group => group.items).find(
    navItem => navItem.id === panel,
  );
  if (stub == null || item == null) {
    return null;
  }
  return (
    <div style={styles.stubWrap}>
      <EmptyState
        icon={<Icon icon={stub.icon} size="lg" />}
        title={item.label}
        description={stub.description}
      />
    </div>
  );
}

// ============= PAGE =============

export default function AiWorkspaceSettingsModalTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 840;

  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<PanelId>('notifications');
  const [navQuery, setNavQuery] = useState('');

  // Notifications panel state (lifted so panel switches don't reset it).
  const [pushLevel, setPushLevel] = useState<PushLevel>('important');
  const [isTestSent, setIsTestSent] = useState(false);
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [enabledPresets, setEnabledPresets] = useState<Set<PresetId>>(
    new Set(['eyes', 'gear', 'check', 'memo']),
  );
  const [ackSelections, setAckSelections] = useState(INITIAL_ACK_SELECTIONS);

  // Experiments + General panel state.
  const [experimentFlags, setExperimentFlags] = useState(INITIAL_EXPERIMENTS);
  const [assistantLabel, setAssistantLabel] = useState('Beacon');
  const [language, setLanguage] = useState('en-US');
  const [reopensLastSession, setReopensLastSession] = useState(true);

  const query = navQuery.trim().toLowerCase();
  const filteredGroups =
    query === ''
      ? NAV_GROUPS
      : NAV_GROUPS.map(group => ({
          ...group,
          items: group.items.filter(item =>
            item.label.toLowerCase().includes(query),
          ),
        })).filter(group => group.items.length > 0);

  // Toggling a preset off reassigns any condition using it to the first
  // preset that survives; the last enabled preset can't be turned off.
  const handlePresetChange = (id: PresetId, isPressed: boolean) => {
    if (isPressed) {
      setEnabledPresets(prev => new Set(prev).add(id));
      return;
    }
    if (!enabledPresets.has(id) || enabledPresets.size <= 1) {
      return;
    }
    const next = new Set(enabledPresets);
    next.delete(id);
    const fallback = EMOJI_PRESETS.find(preset => next.has(preset.id));
    if (fallback == null) {
      return;
    }
    setEnabledPresets(next);
    setAckSelections(prev => {
      const updated = {...prev};
      for (const condition of ACK_CONDITIONS) {
        if (updated[condition.id] === id) {
          updated[condition.id] = fallback.id;
        }
      }
      return updated;
    });
  };

  const activeItem = NAV_GROUPS.flatMap(group => group.items).find(
    item => item.id === activePanel,
  );

  const panelContent =
    activePanel === 'notifications' ? (
      <NotificationsPanel
        isCompact={isCompact}
        pushLevel={pushLevel}
        onPushLevelChange={level => {
          setPushLevel(level);
          setIsTestSent(false);
        }}
        isTestSent={isTestSent}
        onSendTest={() => setIsTestSent(true)}
        devices={devices}
        onRemoveDevice={id =>
          setDevices(prev => prev.filter(device => device.id !== id))
        }
        enabledPresets={enabledPresets}
        onPresetChange={handlePresetChange}
        ackSelections={ackSelections}
        onAckChange={(condition, preset) =>
          setAckSelections(prev => ({...prev, [condition]: preset}))
        }
      />
    ) : activePanel === 'experiments' ? (
      <ExperimentsPanel
        flags={experimentFlags}
        onFlagChange={(id, value) =>
          setExperimentFlags(prev => ({...prev, [id]: value}))
        }
      />
    ) : activePanel === 'general' ? (
      <GeneralPanel
        assistantLabel={assistantLabel}
        onAssistantLabelChange={setAssistantLabel}
        language={language}
        onLanguageChange={setLanguage}
        reopensLastSession={reopensLastSession}
        onReopensLastSessionChange={setReopensLastSession}
      />
    ) : (
      <StubPanel panel={activePanel} />
    );

  const panelPane = (
    <div style={styles.panelPane}>
      <div style={styles.panelHeader}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={3}>{activeItem?.label ?? 'Settings'}</Heading>
              <Text type="supporting" color="secondary">
                {PANEL_SUBTITLES[activePanel]}
              </Text>
            </VStack>
          </StackItem>
          {!isCompact && (
            <IconButton
              label="Close settings"
              tooltip="Close"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsOpen(false)}
            />
          )}
        </HStack>
      </div>
      <div style={styles.panelBody}>{panelContent}</div>
    </div>
  );

  return (
    <div ref={wrapRef} style={styles.pageWrap}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>{WORKSPACE_NAME}</Heading>
                  <StatusDot variant="success" label="Assistant online" />
                  {!isCompact && (
                    <Text type="supporting" color="secondary">
                      #northwind-platform
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <IconButton
                label="Open settings"
                tooltip="Settings"
                icon={<Icon icon={GearIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
              />
              <Avatar name="Riley Nakamura" size="small" />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={6}>
            {/* Dimmed backdrop chat — the dialog's scrim sits over this. */}
            <div style={styles.chatColumn}>
              <ChatMessageList density="balanced">
                <ChatSystemMessage variant="divider">
                  Friday, July 10
                </ChatSystemMessage>
                <ChatMessage sender="user">
                  <ChatMessageBubble
                    metadata={
                      <ChatMessageMetadata
                        timestamp={
                          <Timestamp value="2026-07-10T09:12:00" format="time" />
                        }
                      />
                    }>
                    You pinged me three times during the staging deploy — can
                    we quiet that down without missing real failures?
                  </ChatMessageBubble>
                </ChatMessage>
                <ChatMessage
                  sender="assistant"
                  avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                  <ChatMessageBubble name={ASSISTANT_NAME}>
                    You&apos;re on the &ldquo;All&rdquo; push level, so every
                    progress note pings this browser. Open Settings →
                    Notifications and drop it to &ldquo;Important&rdquo; —
                    you&apos;ll still get approvals, blockers, and failures.
                  </ChatMessageBubble>
                  <ChatMessageMetadata
                    timestamp={
                      <Timestamp value="2026-07-10T09:12:40" format="time" />
                    }
                  />
                </ChatMessage>
                <ChatSystemMessage>
                  Settings opened — changes apply to the {WORKSPACE_NAME}{' '}
                  workspace.
                </ChatSystemMessage>
              </ChatMessageList>
            </div>
          </LayoutContent>
        }
      />

      <Dialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        width={isCompact ? 'min(680px, 94vw)' : 896}
        maxHeight="86vh"
        padding={0}
        purpose="info">
        <div style={isCompact ? styles.dialogBodyCompact : styles.dialogBody}>
          {isCompact ? (
            <SettingsNavStrip
              query={navQuery}
              onQueryChange={setNavQuery}
              groups={filteredGroups}
              activePanel={activePanel}
              onSelect={setActivePanel}
              onClose={() => setIsSettingsOpen(false)}
            />
          ) : (
            <SettingsNavAside
              query={navQuery}
              onQueryChange={setNavQuery}
              groups={filteredGroups}
              activePanel={activePanel}
              onSelect={setActivePanel}
            />
          )}
          {panelPane}
        </div>
      </Dialog>
    </div>
  );
}
`;export{e as default};