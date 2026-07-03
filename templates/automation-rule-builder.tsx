// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (4 lifecycle-hook rules with fixed
 *   metadata, a six-type trigger condition set on the selected hook, and
 *   two script files per hook)
 * @output Lifecycle-hook rules console with a color-coded trigger
 *   condition builder: the left rail lists hook rows (name, muted
 *   "blocks" Badge, clamped description, emerald mini Switch); the detail
 *   pane shows a metadata grid (Event in mono Code, Action, Timeout,
 *   version Badge), an italic auto-generated trigger summary, then the
 *   TRIGGERS editor — one collapsed row per condition type in its exact
 *   color (tool_call blue, tool_pattern purple, keyword pink, channel
 *   green, node orange, event amber), each with a colored dot, an
 *   activates/invokes mode Badge, and a mono value preview. The keyword
 *   row starts expanded with a three-pill activates/invokes/both scope
 *   selector and hint copy; the add-condition form is open with all six
 *   type pill chips. A two-tab script viewer (check.sh / config.json)
 *   with CodeBlock closes the pane.
 * @position Page template; emitted by `astryx template automation-rule-builder`
 *
 * Frame: Layout height="fill". LayoutHeader owns the chrome ("Hooks"
 * title, caption, search TextInput). Body: start LayoutPanel 320 hosts
 * the hook list (rows with divide hairlines, scrollable); LayoutContent
 * scrolls the detail sections — metadata grid, trigger editor stack,
 * add-condition form, script viewer.
 *
 * Responsive contract:
 * - > 900px: hook list panel 320 | detail content.
 * - <= 900px: the panel is hidden; a hook Selector sits above the detail
 *   so selection survives the collapse, and the per-hook enable Switch
 *   (otherwise only in the panel rows) moves into the detail heading row.
 * - <= 900px: the metadata grid drops from two fixed columns to 'multi'
 *   auto-fill so value cells never squeeze below readable width.
 * - <= 900px: the clickable scope pills and add-condition type chips get
 *   a 40px min tap height; desktop keeps the compact sm pills.
 * - Trigger row value previews truncate at ~200px (maxLines={1} inside a
 *   fixed max-width cell); the six type pill chips wrap to two rows.
 * - The script CodeBlock caps at 240px and scrolls internally.
 */

import {useMemo, useState, type CSSProperties} from 'react';

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
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Code} from '@astryxdesign/core/Code';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  FileJsonIcon,
  SearchIcon,
  TerminalIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  headerSearch: {width: 260},
  // Detail column: settings surfaces read best with a max width.
  detailColumn: {
    width: '100%',
    maxWidth: 840,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // The list rail scrolls independently of the detail pane.
  railScroll: {height: '100%', overflowY: 'auto'},
  // Emerald mini switch: the theme's success hue reads as emerald; the
  // scale keeps the row rhythm tight (navi h-4 w-7 mini switches).
  miniSwitch: {transform: 'scale(0.8)', transformOrigin: 'center'},
  // 8px condition-type dot, colored per type.
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  // Mono value previews truncate at ~200px per the responsive contract.
  previewCell: {maxWidth: 200, minWidth: 0},
  triggerRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  triggerBody: {paddingBlock: 'var(--spacing-2)'},
  summaryItalic: {fontStyle: 'italic'},
  chipWrap: {flexWrap: 'wrap'},
  // Active type chip: ring in the chip's own hue (set per render).
  activeChipRing: {borderRadius: 999},
  addForm: {
    border: 'var(--border-width) dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  scriptIcon: {display: 'inline-flex', color: '#059669'},
  narrowSelectorRow: {paddingBottom: 'var(--spacing-3)'},
  // Touch targets: clickable pills grow to ~40px tall on narrow so taps
  // land; minHeight wins over the Token's fixed sm height.
  narrowTapPill: {minHeight: 40},
};

// ============= DATA =============
// Deterministic fixtures: fixed values, no clocks, no randomness.

type ConditionType =
  | 'tool_call'
  | 'tool_pattern'
  | 'keyword'
  | 'channel'
  | 'node'
  | 'event';

/**
 * activates — the condition arms the rule; invokes — the condition runs
 * the script directly; both — either behavior applies.
 */
type TriggerMode = 'activates' | 'invokes' | 'both';

interface TriggerCondition {
  id: string;
  type: ConditionType;
  mode: TriggerMode;
  values: string[];
  /** Mono value preview shown in the collapsed row. */
  preview: string;
}

interface HookScript {
  id: string;
  name: string;
  language: string;
  code: string;
  isExec?: boolean;
}

type HookAction = 'blocks' | 'warn' | 'notify';

interface HookRule {
  id: string;
  name: string;
  description: string;
  action: HookAction;
  event: string;
  actionDetail: string;
  timeout: string;
  version: string;
  /** Italic auto-generated summary; empty string means no triggers. */
  summary: string;
  triggers: TriggerCondition[];
  scripts: HookScript[];
}

// Exact six-type palette from the navi trigger editor: blue / purple /
// pink / green / orange / amber.
const CONDITION_META: Record<
  ConditionType,
  {
    label: string;
    dot: string;
    chip: 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'yellow';
    placeholder: string;
    hint: string;
  }
> = {
  tool_call: {
    label: 'tool_call',
    dot: '#3b82f6',
    chip: 'blue',
    placeholder: 'bash, ipython',
    hint: 'Exact tool names, comma separated.',
  },
  tool_pattern: {
    label: 'tool_pattern',
    dot: '#a855f7',
    chip: 'purple',
    placeholder: 'bash ~ /\\brm -rf\\b/',
    hint: 'Tool name plus a regex applied to its arguments.',
  },
  keyword: {
    label: 'keyword',
    dot: '#ec4899',
    chip: 'pink',
    placeholder: 'sentry, production error',
    hint: 'Matches when these words appear in the prompt or tool output.',
  },
  channel: {
    label: 'channel',
    dot: '#22c55e',
    chip: 'green',
    placeholder: 'web, gchat',
    hint: 'Limits the rule to specific chat surfaces.',
  },
  node: {
    label: 'node',
    dot: '#f97316',
    chip: 'orange',
    placeholder: 'cli, workspace',
    hint: 'Limits the rule to specific runtime nodes.',
  },
  event: {
    label: 'event',
    dot: '#f59e0b',
    chip: 'yellow',
    placeholder: 'PreToolUse',
    hint: 'Lifecycle event that evaluates this rule.',
  },
};

const CONDITION_TYPES: ConditionType[] = [
  'tool_call',
  'tool_pattern',
  'keyword',
  'channel',
  'node',
  'event',
];

// Mode badges: activates = amber, invokes = blue (navi trigger-editor).
const MODE_BADGE: Record<TriggerMode, {label: string; variant: BadgeVariant}> =
  {
    activates: {label: 'activates', variant: 'yellow'},
    invokes: {label: 'invokes', variant: 'blue'},
    both: {label: 'both', variant: 'neutral'},
  };

const ACTION_BADGE: Record<HookAction, string> = {
  blocks: 'blocks',
  warn: 'warn',
  notify: 'notify',
};

const ACTION_TOOLTIP: Record<HookAction, string> = {
  blocks: 'Exit code 2 blocks the tool call',
  warn: 'Logs a warning; the tool call continues',
  notify: 'Sends a notification; the tool call continues',
};

const HOOKS: HookRule[] = [
  {
    id: 'hk-1',
    name: 'Block dangerous rm',
    description: 'Prevents destructive rm -rf commands in bash',
    action: 'blocks',
    event: 'PreToolUse',
    actionDetail: 'Exit 2 blocks execution',
    timeout: '30s',
    version: 'v3',
    summary:
      'Runs before bash or ipython calls matching rm -rf, or when sentry keywords appear.',
    triggers: [
      {
        id: 'hk1-t1',
        type: 'tool_call',
        mode: 'activates',
        values: ['bash', 'ipython'],
        preview: 'bash, ipython',
      },
      {
        id: 'hk1-t2',
        type: 'tool_pattern',
        mode: 'activates',
        values: ['bash ~ /\\brm -rf\\b/'],
        preview: 'bash ~ /\\brm -rf\\b/',
      },
      {
        id: 'hk1-t3',
        type: 'keyword',
        mode: 'both',
        values: ['sentry', 'production error'],
        preview: 'sentry, production error',
      },
      {
        id: 'hk1-t4',
        type: 'channel',
        mode: 'invokes',
        values: ['web', 'gchat'],
        preview: 'web, gchat',
      },
      {
        id: 'hk1-t5',
        type: 'node',
        mode: 'invokes',
        values: ['cli', 'workspace'],
        preview: 'cli, workspace',
      },
      {
        id: 'hk1-t6',
        type: 'event',
        mode: 'activates',
        values: ['PreToolUse'],
        preview: 'PreToolUse',
      },
    ],
    scripts: [
      {
        id: 'hk1-check',
        name: 'check.sh',
        language: 'bash',
        isExec: true,
        code: `#!/usr/bin/env bash
if echo "$TOOL_ARGS" | grep -q "rm -rf"; then
  echo "Blocked: destructive command" >&2
  exit 2
fi`,
      },
      {
        id: 'hk1-config',
        name: 'config.json',
        language: 'json',
        code: '{ "maxDepth": 2 }',
      },
    ],
  },
  {
    id: 'hk-2',
    name: 'Log deploy commands',
    description: 'Appends deploy and rollout commands to the audit log',
    action: 'warn',
    event: 'PostToolUse',
    actionDetail: 'Exit 0 logs and continues',
    timeout: '10s',
    version: 'v1',
    summary: 'Runs after bash calls matching deploy or rollout, log only.',
    triggers: [
      {
        id: 'hk2-t1',
        type: 'tool_pattern',
        mode: 'activates',
        values: ['bash ~ /deploy|rollout/'],
        preview: 'bash ~ /deploy|rollout/',
      },
    ],
    scripts: [
      {
        id: 'hk2-log',
        name: 'log.sh',
        language: 'bash',
        isExec: true,
        code: `#!/usr/bin/env bash
echo "$(date -u +%FT%TZ) $TOOL_NAME $TOOL_ARGS" >> ~/.hooks/audit.log`,
      },
      {
        id: 'hk2-config',
        name: 'config.json',
        language: 'json',
        code: '{ "logPath": "~/.hooks/audit.log" }',
      },
    ],
  },
  {
    id: 'hk-3',
    name: 'Redact secrets in output',
    description: 'Scrubs API keys and tokens from tool output before display',
    action: 'blocks',
    event: 'PostToolUse',
    actionDetail: 'Exit 2 blocks execution',
    timeout: '20s',
    version: 'v2',
    summary: '',
    triggers: [],
    scripts: [
      {
        id: 'hk3-redact',
        name: 'redact.sh',
        language: 'bash',
        isExec: true,
        code: `#!/usr/bin/env bash
sed -E 's/(sk|ghp|xox[bp])-[A-Za-z0-9-]+/[redacted]/g'`,
      },
      {
        id: 'hk3-config',
        name: 'config.json',
        language: 'json',
        code: '{ "patterns": ["sk-", "ghp-", "xoxb-"] }',
      },
    ],
  },
  {
    id: 'hk-4',
    name: 'Notify on sentry keywords',
    description: 'Pages the on-call channel when error keywords surface',
    action: 'notify',
    event: 'PostToolUse',
    actionDetail: 'Exit 0 notifies and continues',
    timeout: '15s',
    version: 'v1',
    summary: 'Runs when sentry keywords appear on the web channel.',
    triggers: [
      {
        id: 'hk4-t1',
        type: 'keyword',
        mode: 'both',
        values: ['sentry', 'production error'],
        preview: 'sentry, production error',
      },
      {
        id: 'hk4-t2',
        type: 'channel',
        mode: 'invokes',
        values: ['web'],
        preview: 'web',
      },
    ],
    scripts: [
      {
        id: 'hk4-notify',
        name: 'notify.sh',
        language: 'bash',
        isExec: true,
        code: `#!/usr/bin/env bash
curl -s -X POST "$ONCALL_WEBHOOK" -d "{\\"text\\": \\"sentry keyword hit\\"}"`,
      },
      {
        id: 'hk4-config',
        name: 'config.json',
        language: 'json',
        code: '{ "channel": "#oncall" }',
      },
    ],
  },
];

// Seed enabled state: "Redact secrets in output" ships with its switch off.
const ENABLED_SEED: Record<string, boolean> = {
  'hk-1': true,
  'hk-2': true,
  'hk-3': false,
  'hk-4': true,
};

const HOOK_OPTIONS = HOOKS.map(hook => ({value: hook.id, label: hook.name}));

/** 'bash, ipython' -> ['bash', 'ipython'] (trimmed, empties dropped). */
function parseValues(raw: string): string[] {
  return raw
    .split(',')
    .map(part => part.trim())
    .filter(part => part !== '');
}

// ============= TRIGGER ROW =============

function TypeDot({type}: {type: ConditionType}) {
  return (
    <span
      style={{...styles.typeDot, backgroundColor: CONDITION_META[type].dot}}
      aria-hidden
    />
  );
}

/**
 * One condition row: collapsed shows dot + mono type + mode Badge + mono
 * value preview; expanded shows the value Tokens, the keyword row's
 * three-pill activates/invokes/both scope selector, and hint copy.
 */
function TriggerRow({
  condition,
  mode,
  rawValue,
  isOpen,
  isNarrow,
  onOpenChange,
  onModeChange,
  onRawValueChange,
}: {
  condition: TriggerCondition;
  mode: TriggerMode;
  /** Comma-separated editable source for the value Tokens + preview. */
  rawValue: string;
  isOpen: boolean;
  /** Narrow viewports get ~40px tap heights on the scope pills. */
  isNarrow: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onModeChange: (mode: TriggerMode) => void;
  onRawValueChange: (raw: string) => void;
}) {
  const meta = CONDITION_META[condition.type];
  const modeBadge = MODE_BADGE[mode];

  return (
    <div style={styles.triggerRow}>
      <Collapsible
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        trigger={
          <HStack gap={2} vAlign="center">
            <TypeDot type={condition.type} />
            <Text type="code" size="sm">
              {meta.label}
            </Text>
            <Badge label={modeBadge.label} variant={modeBadge.variant} />
            <StackItem size="fill" />
            <div style={styles.previewCell}>
              <Text type="code" size="sm" color="secondary" maxLines={1}>
                {condition.preview}
              </Text>
            </div>
          </HStack>
        }>
        <VStack gap={3} style={styles.triggerBody}>
          <HStack gap={1} style={styles.chipWrap}>
            {condition.values.map((value, index) => (
              <Token
                key={`${index}-${value}`}
                label={value}
                size="sm"
                color={meta.chip}
              />
            ))}
          </HStack>
          {condition.type === 'keyword' ? (
            <VStack gap={2}>
              <Text type="label" size="sm" color="secondary">
                Scope
              </Text>
              {/* Three-pill scope selector: the active pill takes the
                  keyword row's pink. */}
              <HStack gap={1}>
                {(['activates', 'invokes', 'both'] as const).map(option => (
                  <Token
                    key={option}
                    label={option}
                    size="sm"
                    color={mode === option ? meta.chip : 'default'}
                    style={isNarrow ? styles.narrowTapPill : undefined}
                    onClick={() => onModeChange(option)}
                  />
                ))}
              </HStack>
            </VStack>
          ) : (
            <TextInput
              label={`${meta.label} value`}
              isLabelHidden
              size="sm"
              placeholder={meta.placeholder}
              value={rawValue}
              onChange={onRawValueChange}
            />
          )}
          <Text type="supporting" color="secondary">
            {meta.hint}
          </Text>
        </VStack>
      </Collapsible>
    </div>
  );
}

// ============= PAGE =============

export default function AutomationRuleBuilderTemplate() {
  const [selectedId, setSelectedId] = useState('hk-1');
  const [query, setQuery] = useState('');
  const [enabled, setEnabled] = useState(ENABLED_SEED);
  // The keyword condition on the selected hook starts expanded.
  const [expandedTriggerId, setExpandedTriggerId] = useState<string | null>(
    'hk1-t3',
  );
  // Scope pill and value edits layer over the fixture conditions.
  const [modeOverrides, setModeOverrides] = useState<
    Record<string, TriggerMode>
  >({});
  const [valueOverrides, setValueOverrides] = useState<Record<string, string>>(
    {},
  );
  // Conditions added from the open form, keyed by hook id.
  const [addedTriggers, setAddedTriggers] = useState<
    Record<string, TriggerCondition[]>
  >({});
  const [addType, setAddType] = useState<ConditionType>('keyword');
  const [addValue, setAddValue] = useState('');
  const [nextAddId, setNextAddId] = useState(1);
  const [activeScriptId, setActiveScriptId] = useState('hk1-check');

  // Responsive contract: below 900px the rail collapses to a Selector.
  const isNarrow = useMediaQuery('(max-width: 900px)');

  const selected = HOOKS.find(hook => hook.id === selectedId) ?? HOOKS[0];

  const visibleHooks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') {
      return HOOKS;
    }
    return HOOKS.filter(
      hook =>
        hook.name.toLowerCase().includes(needle) ||
        hook.description.toLowerCase().includes(needle),
    );
  }, [query]);

  const triggers = useMemo(
    () => [...selected.triggers, ...(addedTriggers[selected.id] ?? [])],
    [selected, addedTriggers],
  );

  const activeScript =
    selected.scripts.find(script => script.id === activeScriptId) ??
    selected.scripts[0];

  const selectHook = (id: string) => {
    const hook = HOOKS.find(item => item.id === id);
    if (!hook) {
      return;
    }
    setSelectedId(id);
    setExpandedTriggerId(null);
    setActiveScriptId(hook.scripts[0].id);
    setAddType('keyword');
    setAddValue('');
  };

  const toggleHook = (id: string, value: boolean) => {
    setEnabled(prev => ({...prev, [id]: value}));
  };

  const addCondition = () => {
    const values = parseValues(addValue);
    if (values.length === 0) {
      return;
    }
    const condition: TriggerCondition = {
      id: `added-${nextAddId}`,
      type: addType,
      mode: 'activates',
      values,
      preview: values.join(', '),
    };
    setAddedTriggers(prev => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] ?? []), condition],
    }));
    setNextAddId(prev => prev + 1);
    setAddValue('');
  };

  const hookList = (
    <List density="compact" hasDividers>
      {visibleHooks.map(hook => (
        <ListItem
          key={hook.id}
          label={
            <HStack gap={2} vAlign="center">
              <Text type="label">{hook.name}</Text>
              <Tooltip content={ACTION_TOOLTIP[hook.action]}>
                <Badge label={ACTION_BADGE[hook.action]} variant="neutral" />
              </Tooltip>
            </HStack>
          }
          description={hook.description}
          endContent={
            <div style={styles.miniSwitch}>
              <Switch
                label={`Enable ${hook.name}`}
                isLabelHidden
                value={enabled[hook.id]}
                onChange={value => toggleHook(hook.id, value)}
              />
            </div>
          }
          onClick={() => selectHook(hook.id)}
          isSelected={hook.id === selectedId}
        />
      ))}
    </List>
  );

  const detail = (
    <VStack gap={5} style={styles.detailColumn}>
      {isNarrow && (
        <div style={styles.narrowSelectorRow}>
          <Selector
            label="Hook"
            isLabelHidden
            options={HOOK_OPTIONS}
            value={selectedId}
            onChange={selectHook}
          />
        </div>
      )}

      {/* ---- Hook heading + metadata grid ---- */}
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Heading level={2}>{selected.name}</Heading>
          <Badge label={ACTION_BADGE[selected.action]} variant="neutral" />
          {!enabled[selected.id] && (
            <Badge label="disabled" variant="warning" />
          )}
          {/* The panel rows own the enable Switch on desktop; when the
              panel collapses the toggle moves here so narrow viewports
              can still enable/disable the hook. */}
          {isNarrow && (
            <>
              <StackItem size="fill" />
              <Switch
                label={`Enable ${selected.name}`}
                isLabelHidden
                value={enabled[selected.id]}
                onChange={value => toggleHook(selected.id, value)}
              />
            </>
          )}
        </HStack>
        <Text type="supporting" color="secondary">
          {selected.description}
        </Text>
      </VStack>

      {/* Narrow drops the two fixed columns for 'multi' auto-fill so value
          cells keep readable width (same move as table-split-pane). */}
      <MetadataList
        columns={isNarrow ? 'multi' : 2}
        label={{position: 'start', width: 64}}>
        <MetadataListItem label="Event">
          <Code>{selected.event}</Code>
        </MetadataListItem>
        <MetadataListItem label="Action">
          <Text type="body">{selected.actionDetail}</Text>
        </MetadataListItem>
        <MetadataListItem label="Timeout">
          <Text type="body" hasTabularNumbers>
            {selected.timeout}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Version">
          <Badge label={selected.version} />
        </MetadataListItem>
      </MetadataList>

      <Divider />

      {/* ---- Trigger editor ---- */}
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Heading level={3}>Triggers</Heading>
          <Text type="supporting" color="secondary">
            {triggers.length === 0
              ? 'matches everything'
              : `${triggers.length} condition${triggers.length === 1 ? '' : 's'}`}
          </Text>
        </HStack>
        <Text type="supporting" color="secondary" style={styles.summaryItalic}>
          {triggers.length === 0
            ? 'No triggers — matches all tool calls.'
            : selected.summary}
        </Text>
        {triggers.length > 0 && (
          <VStack gap={2}>
            {triggers.map(condition => {
              // Value edits keep the raw comma text so trailing commas and
              // spaces survive typing; tokens + preview use the parsed form.
              const raw =
                valueOverrides[condition.id] ?? condition.values.join(', ');
              const values =
                valueOverrides[condition.id] === undefined
                  ? condition.values
                  : parseValues(raw);
              const effective =
                values === condition.values
                  ? condition
                  : {...condition, values, preview: values.join(', ')};
              return (
                <TriggerRow
                  key={condition.id}
                  condition={effective}
                  mode={modeOverrides[condition.id] ?? condition.mode}
                  rawValue={raw}
                  isOpen={expandedTriggerId === condition.id}
                  isNarrow={isNarrow}
                  onOpenChange={isOpen =>
                    setExpandedTriggerId(isOpen ? condition.id : null)
                  }
                  onModeChange={mode =>
                    setModeOverrides(prev => ({...prev, [condition.id]: mode}))
                  }
                  onRawValueChange={value =>
                    setValueOverrides(prev => ({
                      ...prev,
                      [condition.id]: value,
                    }))
                  }
                />
              );
            })}
          </VStack>
        )}

        {/* ---- Add-condition form (always open) ---- */}
        <div style={styles.addForm}>
          <VStack gap={3}>
            <Text type="label" size="sm" color="secondary">
              Add condition
            </Text>
            <HStack gap={1} style={styles.chipWrap}>
              {CONDITION_TYPES.map(type => {
                const meta = CONDITION_META[type];
                const isActive = type === addType;
                return (
                  <div
                    key={type}
                    style={
                      isActive
                        ? {
                            ...styles.activeChipRing,
                            boxShadow: `0 0 0 2px ${meta.dot}`,
                          }
                        : undefined
                    }>
                    <Token
                      label={meta.label}
                      size="sm"
                      color={meta.chip}
                      style={isNarrow ? styles.narrowTapPill : undefined}
                      onClick={() => setAddType(type)}
                    />
                  </div>
                );
              })}
            </HStack>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <TextInput
                  label="Condition value"
                  isLabelHidden
                  size="sm"
                  placeholder={CONDITION_META[addType].placeholder}
                  value={addValue}
                  onChange={setAddValue}
                />
              </StackItem>
              <IconButton
                label="Cancel add condition"
                tooltip="Cancel"
                icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => setAddValue('')}
              />
              <Button
                label="Add"
                size="sm"
                icon={<Icon icon={PlusIcon} size="sm" />}
                onClick={addCondition}
              />
            </HStack>
            <Text type="supporting" color="secondary">
              {CONDITION_META[addType].hint}
            </Text>
          </VStack>
        </div>
      </VStack>

      <Divider />

      {/* ---- Script file viewer ---- */}
      <VStack gap={2}>
        <Heading level={3}>Scripts</Heading>
        <TabList
          value={activeScript.id}
          onChange={setActiveScriptId}
          size="sm">
          {selected.scripts.map(script => (
            <Tab
              key={script.id}
              value={script.id}
              label={script.name}
              icon={
                <span
                  style={
                    script.isExec
                      ? styles.scriptIcon
                      : {display: 'inline-flex'}
                  }>
                  <Icon
                    icon={script.isExec ? TerminalIcon : FileJsonIcon}
                    size="sm"
                    color="inherit"
                  />
                </span>
              }
              endContent={
                script.isExec ? <Badge label="exec" variant="green" /> : null
              }
            />
          ))}
        </TabList>
        <CodeBlock
          code={activeScript.code}
          language={activeScript.language}
          size="sm"
          width="100%"
          maxHeight={240}
          hasCopyButton={false}
        />
      </VStack>
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={1}>
                <Heading level={1}>Hooks</Heading>
                <Text type="supporting" color="secondary">
                  Lifecycle hooks that gate or observe tool calls
                </Text>
              </VStack>
            </StackItem>
            <div style={styles.headerSearch}>
              <TextInput
                label="Search hooks"
                isLabelHidden
                size="sm"
                placeholder="Search hooks…"
                startIcon={<Icon icon={SearchIcon} size="sm" />}
                value={query}
                onChange={setQuery}
              />
            </div>
          </HStack>
        </LayoutHeader>
      }
      start={
        isNarrow ? undefined : (
          <LayoutPanel width={320} padding={0} hasDivider label="Hook list">
            <div style={styles.railScroll}>{hookList}</div>
          </LayoutPanel>
        )
      }
      content={<LayoutContent>{detail}</LayoutContent>}
    />
  );
}
