var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (18 slash commands — 12 built-in, 6
 *   custom — with aliases, categories, usage strings, scopes, enabled and
 *   hidden flags, and one prompt-template fixture per custom command)
 * @output Slash-command library manager for an AI chat product: header with
 *   the command census caption and a New command action; a toolbar with a
 *   scope SegmentedControl (All / Personal / Workspace) and search; a dense
 *   command list where each row carries the mono /name, alias Tokens, an
 *   emerald Skill Badge on skill-backed commands, a category Badge, the mono
 *   usage string, description, scope label, a hidden eye-off marker, a
 *   per-row enable Switch, and an Edit / Duplicate / Delete kebab; plus an
 *   editor drawer (rendered open for the custom /fork override) with a
 *   "/"-prefixed InputGroup name field, description, prompt-template
 *   TextArea with an {input} note, scope RadioList, a collision warning
 *   Banner, and a usage-counter caption
 * @position Page template; emitted by \`astryx template ai-chat-slash-commands\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the title, census
 * caption, and New command button. LayoutContent hosts the toolbar + list
 * column; the editor lives in a 380px end LayoutPanel. Unlike
 * ai-chat-tool-stream (a live transcript) this is the management surface
 * for the "/" menu itself — no chat renders here.
 *
 * Responsive contract:
 * - The demo stage never fires viewport media queries, so the page measures
 *   its own width with a ResizeObserver (useElementWidth).
 * - >900px: editor in the end LayoutPanel; rows show the scope column.
 * - <=900px: the end panel is dropped and the editor folds inline below the
 *   list as a Card; rows shed the scope label (the editor still states it)
 *   and the toolbar wraps onto two lines.
 * - The name/usage/description cell truncates first (minWidth 0, one line
 *   each); Badges, Switch, and kebab keep intrinsic width.
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
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {InputGroup, InputGroupText} from '@astryxdesign/core/InputGroup';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Switch} from '@astryxdesign/core/Switch';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {
  CopyIcon,
  EyeOffIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SlashIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  pageWrap: {height: '100%'},
  contentColumn: {
    maxWidth: 880,
    marginInline: 'auto',
  },
  toolbarWrap: {flexWrap: 'wrap'},
  searchCell: {minWidth: 220},
  // 10-11px uppercase tracking-wide section eyebrow.
  eyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  listCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  // Rows keep a transparent accent edge so selection never shifts layout.
  row: {
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    borderInlineStart: '2px solid transparent',
    cursor: 'pointer',
  },
  rowSelected: {
    backgroundColor: 'var(--color-background-muted)',
    borderInlineStartColor: 'var(--color-accent)',
  },
  rowMainCell: {minWidth: 0},
  rowNameLine: {flexWrap: 'wrap'},
  rowDisabledText: {opacity: 0.55},
  editorBody: {padding: 'var(--spacing-4)'},
  promptNote: {marginTop: 'calc(var(--spacing-1) * -1)'},
  inlineEditorWrap: {paddingTop: 'var(--spacing-4)'},
};

// ============= DATA =============
// Deterministic fixtures: fixed counts and strings, no clocks, no randomness.

const PRODUCT_NAME = 'Beacon Copilot';
const WORKSPACE_NAME = 'Atlas team';
const MAX_CUSTOM_COMMANDS = 50;

type CommandCategory = 'commands' | 'model' | 'session' | 'tools';
type CommandScope = 'built-in' | 'personal' | 'workspace';

const CATEGORY_META: Record<
  CommandCategory,
  {label: string; variant: 'neutral' | 'info' | 'purple' | 'orange'}
> = {
  commands: {label: 'Commands', variant: 'neutral'},
  model: {label: 'Model', variant: 'info'},
  session: {label: 'Session', variant: 'purple'},
  tools: {label: 'Tools', variant: 'orange'},
};

const SCOPE_LABEL: Record<CommandScope, string> = {
  'built-in': 'Built-in',
  personal: 'Personal',
  workspace: WORKSPACE_NAME,
};

interface SlashCommand {
  id: string;
  /** Command name without the leading slash. */
  name: string;
  aliases: string[];
  category: CommandCategory;
  usage: string;
  description: string;
  scope: CommandScope;
  isEnabled: boolean;
  /** Backed by a skill package — carries the emerald Skill badge. */
  isSkill?: boolean;
  /** Excluded from the "/" menu; still runnable by exact name. */
  isHidden?: boolean;
  /** Custom commands only. */
  promptTemplate?: string;
  usedCount?: number;
}

const INITIAL_COMMANDS: SlashCommand[] = [
  // ----- Built-in (12) -----
  {
    id: 'cmd-help',
    name: 'help',
    aliases: ['h', '?'],
    category: 'commands',
    usage: '/help [command]',
    description: 'List every command or explain one in detail.',
    scope: 'built-in',
    isEnabled: true,
  },
  {
    id: 'cmd-compact',
    name: 'compact',
    aliases: [],
    category: 'session',
    usage: '/compact [keep-last:n]',
    description: 'Summarize older turns to reclaim context window.',
    scope: 'built-in',
    isEnabled: true,
  },
  {
    id: 'cmd-fork',
    name: 'fork',
    aliases: ['branch'],
    category: 'session',
    usage: '/fork [title]',
    description: 'Branch this conversation into a new session.',
    scope: 'built-in',
    isEnabled: true,
  },
  {
    id: 'cmd-model',
    name: 'model',
    aliases: [],
    category: 'model',
    usage: '/model [name|list]',
    description: 'Switch the active model or list what is available.',
    scope: 'built-in',
    isEnabled: true,
  },
  {
    id: 'cmd-aside',
    name: 'aside',
    aliases: [],
    category: 'session',
    usage: '/aside [question]',
    description:
      'Ask a side question with full context, kept out of the main chat.',
    scope: 'built-in',
    isEnabled: true,
  },
  {
    id: 'cmd-stop',
    name: 'stop',
    aliases: ['halt'],
    category: 'commands',
    usage: '/stop [--force]',
    description: 'Interrupt the running agent at the next safe point.',
    scope: 'built-in',
    isEnabled: true,
  },
  {
    id: 'cmd-clear',
    name: 'clear',
    aliases: [],
    category: 'session',
    usage: '/clear',
    description: 'Start the transcript fresh without losing workspace files.',
    scope: 'built-in',
    isEnabled: true,
  },
  {
    id: 'cmd-rename',
    name: 'rename',
    aliases: [],
    category: 'session',
    usage: '/rename [title]',
    description: 'Retitle the current session.',
    scope: 'built-in',
    isEnabled: true,
  },
  {
    id: 'cmd-tools',
    name: 'tools',
    aliases: [],
    category: 'tools',
    usage: '/tools [enable|disable] [name]',
    description: 'Inspect or toggle the tools the agent may call.',
    scope: 'built-in',
    isEnabled: true,
  },
  {
    id: 'cmd-memory',
    name: 'memory',
    aliases: [],
    category: 'tools',
    usage: '/memory [show|edit]',
    description: 'Open the workspace memory index.',
    scope: 'built-in',
    isEnabled: true,
  },
  {
    id: 'cmd-schedule',
    name: 'schedule',
    aliases: ['cron'],
    category: 'tools',
    usage: '/schedule [expr] [prompt]',
    description: 'Run a prompt on a recurring schedule.',
    scope: 'built-in',
    isEnabled: true,
  },
  {
    id: 'cmd-verbosity',
    name: 'verbosity',
    aliases: [],
    category: 'model',
    usage: '/verbosity [0|1|2]',
    description: 'Set how chatty team-chat status updates are.',
    scope: 'built-in',
    isEnabled: false,
  },
  // ----- Custom (6) -----
  {
    id: 'cmd-goal',
    name: 'goal',
    aliases: [],
    category: 'commands',
    usage: '/goal [objective|status|pause]',
    description: 'Track a working objective across turns and report drift.',
    scope: 'personal',
    isEnabled: true,
    promptTemplate:
      'Track this objective for the rest of the session: {input}.\\n' +
      'Flag me when a reply starts drifting away from it.',
    usedCount: 112,
  },
  {
    id: 'cmd-standup',
    name: 'standup',
    aliases: ['su'],
    category: 'commands',
    usage: '/standup [yesterday|today]',
    description: 'Draft my standup from merged PRs and session activity.',
    scope: 'workspace',
    isEnabled: true,
    isSkill: true,
    promptTemplate:
      'Draft a standup update for {input}. Pull merged PRs, review ' +
      'comments, and session titles from the last working day.',
    usedCount: 58,
  },
  {
    id: 'cmd-retro',
    name: 'retro',
    aliases: [],
    category: 'session',
    usage: '/retro [sprint]',
    description: 'Assemble a sprint retro doc from session highlights.',
    scope: 'workspace',
    isEnabled: true,
    isSkill: true,
    promptTemplate:
      'Build a retro doc for sprint {input}: wins, misses, and one ' +
      'process change, each backed by a linked session.',
    usedCount: 9,
  },
  {
    id: 'cmd-shiplog',
    name: 'shiplog',
    aliases: [],
    category: 'tools',
    usage: '/shiplog [entry]',
    description: 'Append a line to my private ship log file.',
    scope: 'personal',
    isEnabled: true,
    isHidden: true,
    promptTemplate:
      'Append "{input}" to notes/shiplog.md with today’s date. ' +
      'Reply with only the new line.',
    usedCount: 203,
  },
  {
    id: 'cmd-oncall',
    name: 'oncall',
    aliases: ['oc'],
    category: 'tools',
    usage: '/oncall [handoff|status]',
    description: 'Summarize open incidents for the next on-call.',
    scope: 'workspace',
    isEnabled: false,
    promptTemplate:
      'Prepare an on-call {input} summary: open incidents, silenced ' +
      'alerts, and anything paged twice this week.',
    usedCount: 17,
  },
  {
    id: 'cmd-fork-custom',
    name: 'fork',
    aliases: [],
    category: 'session',
    usage: '/fork [title] [--no-task]',
    description: 'Fork with Atlas branch naming and a linked tracker task.',
    scope: 'workspace',
    isEnabled: true,
    promptTemplate:
      'Fork this session titled {input}. Create a branch named ' +
      'atlas/{input} (kebab-cased) and open a tracker task linked ' +
      'to the fork unless --no-task is passed.',
    usedCount: 34,
  },
];

// ============= HELPERS =============

/**
 * The demo renders pages in a ~1045-1075px inline stage, so viewport media
 * queries never fire there; measure the page's own width instead.
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

interface EditorDraft {
  name: string;
  description: string;
  promptTemplate: string;
  scope: 'personal' | 'workspace';
}

function draftFromCommand(command: SlashCommand): EditorDraft {
  return {
    name: command.name,
    description: command.description,
    promptTemplate: command.promptTemplate ?? '',
    scope: command.scope === 'workspace' ? 'workspace' : 'personal',
  };
}

// ============= COMMAND ROW =============

function CommandRow({
  command,
  isSelected,
  isCompact,
  onSelect,
  onToggleEnabled,
  onDuplicate,
  onDelete,
}: {
  command: SlashCommand;
  isSelected: boolean;
  isCompact: boolean;
  onSelect: (id: string) => void;
  onToggleEnabled: (id: string, isEnabled: boolean) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isBuiltIn = command.scope === 'built-in';
  const category = CATEGORY_META[command.category];
  const menuItems = isBuiltIn
    ? [{label: 'Duplicate', icon: CopyIcon, onClick: () => onDuplicate(command.id)}]
    : [
        {label: 'Edit', icon: PencilIcon, onClick: () => onSelect(command.id)},
        {
          label: 'Duplicate',
          icon: CopyIcon,
          onClick: () => onDuplicate(command.id),
        },
        {type: 'divider' as const},
        {label: 'Delete', icon: Trash2Icon, onClick: () => onDelete(command.id)},
      ];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={\`/\${command.name}, \${category.label}, \${SCOPE_LABEL[command.scope]}\${command.isEnabled ? '' : ', disabled'}\`}
      style={isSelected ? {...styles.row, ...styles.rowSelected} : styles.row}
      onClick={() => onSelect(command.id)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(command.id);
        }
      }}>
      <HStack gap={3} vAlign="center">
        {/* Trailing controls swallow clicks so they never toggle selection. */}
        <div onClick={event => event.stopPropagation()}>
          <Switch
            label={\`Enable /\${command.name}\`}
            isLabelHidden
            value={command.isEnabled}
            onChange={checked => onToggleEnabled(command.id, checked)}
          />
        </div>
        <StackItem size="fill" style={styles.rowMainCell}>
          <VStack
            gap={1}
            style={command.isEnabled ? undefined : styles.rowDisabledText}>
            <HStack gap={2} vAlign="center" style={styles.rowNameLine}>
              <Text type="code" size="sm">
                /{command.name}
              </Text>
              {command.aliases.map(alias => (
                <Token key={alias} label={\`/\${alias}\`} size="sm" />
              ))}
              {command.isSkill === true && (
                <Badge label="Skill" variant="green" />
              )}
              {command.isHidden === true && (
                <HStack gap={1} vAlign="center">
                  <Icon icon={EyeOffIcon} size="sm" color="secondary" />
                  <Text type="supporting" size="sm" color="secondary">
                    Hidden
                  </Text>
                </HStack>
              )}
            </HStack>
            <Text type="code" size="sm" color="secondary" maxLines={1}>
              {command.usage}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {command.description}
            </Text>
          </VStack>
        </StackItem>
        <Badge label={category.label} variant={category.variant} />
        {!isCompact && (
          <Text type="supporting" size="sm" color="secondary">
            {SCOPE_LABEL[command.scope]}
          </Text>
        )}
        <div onClick={event => event.stopPropagation()}>
          <MoreMenu
            label={\`More options for /\${command.name}\`}
            size="sm"
            items={menuItems}
          />
        </div>
      </HStack>
    </div>
  );
}

// ============= EDITOR =============

function CommandEditor({
  command,
  draft,
  hasCollision,
  onDraftChange,
  onSave,
  onRevert,
  onDuplicate,
  onClose,
}: {
  command: SlashCommand;
  draft: EditorDraft;
  hasCollision: boolean;
  onDraftChange: (draft: EditorDraft) => void;
  onSave: () => void;
  onRevert: () => void;
  onDuplicate: (id: string) => void;
  onClose: () => void;
}) {
  const isBuiltIn = command.scope === 'built-in';
  const category = CATEGORY_META[command.category];

  const header = (
    <HStack gap={2} vAlign="center">
      <StackItem size="fill">
        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
            {isBuiltIn ? 'Built-in command' : 'Command editor'}
          </Text>
          <Text type="code">/{command.name}</Text>
        </VStack>
      </StackItem>
      <IconButton
        label="Close editor"
        tooltip="Close"
        icon={<Icon icon={XIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={onClose}
      />
    </HStack>
  );

  if (isBuiltIn) {
    return (
      <VStack gap={4}>
        {header}
        <Divider />
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <Badge label={category.label} variant={category.variant} />
            <Text type="supporting" color="secondary">
              Ships with {PRODUCT_NAME}
            </Text>
          </HStack>
          <Text type="code" size="sm" color="secondary">
            {command.usage}
          </Text>
          {command.aliases.length > 0 && (
            <HStack gap={1} vAlign="center">
              <Text type="supporting" size="sm" color="secondary">
                Aliases
              </Text>
              {command.aliases.map(alias => (
                <Token key={alias} label={\`/\${alias}\`} size="sm" />
              ))}
            </HStack>
          )}
          <Text type="supporting" color="secondary">
            {command.description}
          </Text>
        </VStack>
        <Divider />
        <Text type="supporting" color="secondary">
          Built-in commands can&rsquo;t be edited. Duplicate one to customize
          its prompt.
        </Text>
        <Button
          label="Duplicate to customize"
          variant="secondary"
          size="sm"
          onClick={() => onDuplicate(command.id)}
        />
      </VStack>
    );
  }

  return (
    <VStack gap={4}>
      {header}
      <Divider />
      <InputGroup label="Command name" size="sm">
        <InputGroupText>/</InputGroupText>
        <TextInput
          label="Command name"
          isLabelHidden
          value={draft.name}
          onChange={value => onDraftChange({...draft, name: value})}
        />
      </InputGroup>
      <TextInput
        label="Description"
        size="sm"
        value={draft.description}
        onChange={value => onDraftChange({...draft, description: value})}
      />
      <VStack gap={1}>
        <TextArea
          label="Prompt template"
          rows={5}
          value={draft.promptTemplate}
          onChange={value => onDraftChange({...draft, promptTemplate: value})}
        />
        <div style={styles.promptNote}>
          <Text type="supporting" size="sm" color="secondary">
            {'{input}'} is replaced with everything typed after the command.
          </Text>
        </div>
      </VStack>
      <RadioList
        label="Scope"
        value={draft.scope}
        onChange={value =>
          onDraftChange({...draft, scope: value === 'workspace' ? 'workspace' : 'personal'})
        }
        size="sm">
        <RadioListItem
          label="Personal"
          value="personal"
          description="Only you can run it, in any workspace"
        />
        <RadioListItem
          label={WORKSPACE_NAME}
          value="workspace"
          description={\`Everyone in \${WORKSPACE_NAME} can run it\`}
        />
      </RadioList>
      {hasCollision && (
        <Banner
          status="warning"
          title="Name collision"
          description={\`Conflicts with built-in /\${draft.name} — your command wins in this workspace.\`}
        />
      )}
      <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
        Used {command.usedCount ?? 0} times · max {MAX_CUSTOM_COMMANDS} custom
        commands per user
      </Text>
      <HStack gap={2}>
        <Button label="Save changes" size="sm" onClick={onSave} />
        <Button label="Revert" variant="ghost" size="sm" onClick={onRevert} />
      </HStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function AiChatSlashCommandsTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 900;

  const [commands, setCommands] = useState(INITIAL_COMMANDS);
  const [scopeFilter, setScopeFilter] = useState('all');
  const [query, setQuery] = useState('');
  // The custom /fork override starts selected so the editor drawer — and
  // its collision warning — render open by default.
  const [selectedId, setSelectedId] = useState<string | null>(
    'cmd-fork-custom',
  );
  const [draft, setDraft] = useState<EditorDraft>(() => {
    const initial = INITIAL_COMMANDS.find(
      command => command.id === 'cmd-fork-custom',
    );
    return initial != null
      ? draftFromCommand(initial)
      : {name: '', description: '', promptTemplate: '', scope: 'personal'};
  });
  // Deterministic id counter for New command / Duplicate.
  const [nextNewId, setNextNewId] = useState(1);

  const selected = commands.find(command => command.id === selectedId) ?? null;

  const builtInCount = commands.filter(
    command => command.scope === 'built-in',
  ).length;
  const customCount = commands.length - builtInCount;

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = commands.filter(command => {
    if (scopeFilter === 'personal' && command.scope !== 'personal') {
      return false;
    }
    if (scopeFilter === 'workspace' && command.scope !== 'workspace') {
      return false;
    }
    if (normalizedQuery.length === 0) {
      return true;
    }
    const haystack = [
      command.name,
      ...command.aliases,
      command.description,
      command.usage,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  // A custom command collides when a *built-in* shares its (edited) name.
  const hasCollision =
    selected != null &&
    selected.scope !== 'built-in' &&
    commands.some(
      command =>
        command.scope === 'built-in' &&
        command.name === draft.name.trim().replace(/^\\//u, ''),
    );

  const selectCommand = (id: string) => {
    const command = commands.find(item => item.id === id);
    if (command == null) {
      return;
    }
    setSelectedId(id);
    setDraft(draftFromCommand(command));
  };

  const toggleEnabled = (id: string, isEnabled: boolean) => {
    setCommands(prev =>
      prev.map(command =>
        command.id === id ? {...command, isEnabled} : command,
      ),
    );
  };

  const deleteCommand = (id: string) => {
    setCommands(prev => prev.filter(command => command.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const duplicateCommand = (id: string) => {
    const source = commands.find(command => command.id === id);
    if (source == null) {
      return;
    }
    const copy: SlashCommand = {
      ...source,
      id: \`cmd-new-\${nextNewId}\`,
      name: \`\${source.name}-copy\`,
      aliases: [],
      scope: 'personal',
      isSkill: false,
      promptTemplate:
        source.promptTemplate ?? \`Run /\${source.name} with {input}.\`,
      usedCount: 0,
    };
    setNextNewId(prev => prev + 1);
    setCommands(prev => [...prev, copy]);
    setSelectedId(copy.id);
    setDraft(draftFromCommand(copy));
  };

  const createCommand = () => {
    const fresh: SlashCommand = {
      id: \`cmd-new-\${nextNewId}\`,
      name: \`untitled-\${nextNewId}\`,
      aliases: [],
      category: 'commands',
      usage: \`/untitled-\${nextNewId} [input]\`,
      description: 'Describe what this command does.',
      scope: 'personal',
      isEnabled: true,
      promptTemplate: '{input}',
      usedCount: 0,
    };
    setNextNewId(prev => prev + 1);
    setCommands(prev => [...prev, fresh]);
    setSelectedId(fresh.id);
    setDraft(draftFromCommand(fresh));
  };

  const saveDraft = () => {
    if (selected == null) {
      return;
    }
    const cleanName = draft.name.trim().replace(/^\\//u, '');
    setCommands(prev =>
      prev.map(command =>
        command.id === selected.id
          ? {
              ...command,
              name: cleanName.length > 0 ? cleanName : command.name,
              description: draft.description,
              promptTemplate: draft.promptTemplate,
              scope: draft.scope,
            }
          : command,
      ),
    );
  };

  const revertDraft = () => {
    if (selected != null) {
      setDraft(draftFromCommand(selected));
    }
  };

  const editor =
    selected != null ? (
      <CommandEditor
        command={selected}
        draft={draft}
        hasCollision={hasCollision}
        onDraftChange={setDraft}
        onSave={saveDraft}
        onRevert={revertDraft}
        onDuplicate={duplicateCommand}
        onClose={() => setSelectedId(null)}
      />
    ) : null;

  const lastIndex = filtered.length - 1;

  return (
    <div ref={wrapRef} style={styles.pageWrap}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <Icon icon={SlashIcon} size="md" color="secondary" />
              <StackItem size="fill">
                <VStack gap={1}>
                  <Heading level={1}>Slash commands</Heading>
                  <Text
                    type="supporting"
                    color="secondary"
                    hasTabularNumbers>
                    {commands.length} commands · {builtInCount} built-in ·{' '}
                    {customCount} custom
                  </Text>
                </VStack>
              </StackItem>
              <Button
                label="New command"
                size="sm"
                icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
                onClick={createCommand}
              />
            </HStack>
          </LayoutHeader>
        }
        end={
          !isCompact && editor != null ? (
            <LayoutPanel
              hasDivider
              isScrollable
              width={380}
              padding={0}
              label="Command editor">
              <div style={styles.editorBody}>{editor}</div>
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent>
            <div style={styles.contentColumn}>
              <VStack gap={3}>
                <HStack gap={2} vAlign="center" style={styles.toolbarWrap}>
                  <SegmentedControl
                    label="Filter commands by scope"
                    size="sm"
                    value={scopeFilter}
                    onChange={setScopeFilter}>
                    <SegmentedControlItem value="all" label="All" />
                    <SegmentedControlItem value="personal" label="Personal" />
                    <SegmentedControlItem value="workspace" label="Workspace" />
                  </SegmentedControl>
                  <StackItem size="fill" style={styles.searchCell}>
                    <TextInput
                      label="Search commands"
                      isLabelHidden
                      size="sm"
                      placeholder="Search commands…"
                      startIcon={SearchIcon}
                      hasClear
                      value={query}
                      onChange={setQuery}
                    />
                  </StackItem>
                </HStack>
                {filtered.length === 0 ? (
                  <EmptyState
                    icon={<Icon icon={SearchIcon} size="lg" />}
                    title="No commands match"
                    description="Try a different search or clear the scope filter."
                  />
                ) : (
                  <div style={styles.listCard}>
                    {filtered.map((command, index) => (
                      <VStack key={command.id} gap={0}>
                        <CommandRow
                          command={command}
                          isSelected={command.id === selectedId}
                          isCompact={isCompact}
                          onSelect={selectCommand}
                          onToggleEnabled={toggleEnabled}
                          onDuplicate={duplicateCommand}
                          onDelete={deleteCommand}
                        />
                        {index < lastIndex && <Divider />}
                      </VStack>
                    ))}
                  </div>
                )}
                {isCompact && editor != null && (
                  <div style={styles.inlineEditorWrap}>
                    <Card padding={4}>{editor}</Card>
                  </div>
                )}
              </VStack>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};