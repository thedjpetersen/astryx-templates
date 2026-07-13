var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (7 lifecycle hooks with event, matcher,
 *   on-failure policy, timeout, version, editable trigger rows, a bash hook
 *   script, and a 5-run history per hook; fixed relative-time labels)
 * @output Master-detail agent hooks console: a searchable left rail lists 7
 *   hooks (name, event Badge — PreToolUse / PostToolUse / SessionStart —
 *   an error-count Badge on one, mini enable Switch); the detail pane shows
 *   a metadata grid (Event, Matcher mono chip, On failure block/warn,
 *   Timeout, Version), then a TRIGGERS editor whose rows carry a colored
 *   type dot + type Selector (tool_call / tool_pattern / keyword / channel /
 *   node / event), an activates/invokes mode chip toggle, and a value
 *   TextInput with a per-type CSV placeholder plus add/remove row controls;
 *   below, the hook script in a copyable CodeBlock and a RUN HISTORY strip
 *   (last 5 runs: status dot + duration + relative time). "New hook"
 *   appends a fresh disabled hook with an empty run history.
 * @position Page template; emitted by \`astryx template agent-hooks-automation\`
 *
 * Frame: Layout height="fill". LayoutHeader owns the chrome (title, live
 * "7 hooks · N enabled" caption, New hook button). Body: start LayoutPanel
 * 300 hosts the search input + hook list; LayoutContent scrolls the detail
 * column (metadata grid, trigger editor, script, run history).
 *
 * Responsive contract (measured via a local ResizeObserver — the demo's
 * inline stage never fires viewport media queries):
 * - > 860px: hook rail 300 | detail column (maxWidth 840, centered).
 * - <= 860px: the rail is hidden; a hook Selector sits above the detail so
 *   selection survives, and the enable Switch moves into the heading row.
 * - <= 860px: the metadata grid drops its two fixed columns for 'multi'
 *   auto-fill so value cells never squeeze below readable width.
 * - Trigger rows wrap: the type Selector + mode chip stay on one line and
 *   the value input takes the full remaining width (minWidth 160 before
 *   wrapping); run-history pills wrap onto multiple lines.
 */

import {
  useEffect,
  useMemo,
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
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Code} from '@astryxdesign/core/Code';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {PlusIcon, SearchIcon, XIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Detail column: settings surfaces read best with a max width.
  detailColumn: {
    width: '100%',
    maxWidth: 840,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // The rail scrolls independently of the detail pane.
  railScroll: {height: '100%', overflowY: 'auto'},
  railSearch: {
    padding: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  // Mini switch keeps the rail rows tight (source uses h-4 w-7 switches).
  miniSwitch: {transform: 'scale(0.8)', transformOrigin: 'center'},
  // 10-11px uppercase tracking-wide section eyebrows (source density).
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  // 8px trigger-type dot, colored per type via light-dark() pairs.
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  triggerRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  triggerRowWrap: {flexWrap: 'wrap'},
  typeSelectorCell: {width: 148, flexShrink: 0},
  // The value input takes the remaining width; below ~160px it wraps to
  // its own full-width line instead of squeezing.
  valueCell: {flexGrow: 1, flexBasis: 160, minWidth: 160},
  runStrip: {flexWrap: 'wrap'},
  runPill: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
    flexShrink: 0,
  },
  emptyRuns: {
    border: 'var(--border-width) dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  narrowSelectorRow: {paddingBottom: 'var(--spacing-2)'},
};

// ============= RESPONSIVE HELPER =============
// The demo renders pages in an inline stage narrower than the window, so
// viewport media queries never fire there; measure the page itself.

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
// Deterministic fixtures: fixed values, no clocks, no randomness.

const PRODUCT_NAME = 'Foundry Agent';

type HookEvent = 'PreToolUse' | 'PostToolUse' | 'SessionStart';
type FailurePolicy = 'block' | 'warn';
type TriggerType =
  | 'tool_call'
  | 'tool_pattern'
  | 'keyword'
  | 'channel'
  | 'node'
  | 'event';
type TriggerMode = 'activates' | 'invokes';
type RunStatus = 'success' | 'error' | 'timeout' | 'skipped';

interface TriggerRow {
  id: string;
  type: TriggerType;
  mode: TriggerMode;
  /** Raw CSV (or pattern) text — edited in place. */
  value: string;
}

interface HookRun {
  id: string;
  status: RunStatus;
  duration: string;
  when: string;
}

interface AgentHook {
  id: string;
  name: string;
  description: string;
  event: HookEvent;
  matcher: string;
  onFailure: FailurePolicy;
  timeout: string;
  version: string;
  errorCount?: number;
  triggers: TriggerRow[];
  script: string;
  runs: HookRun[];
}

const EVENT_BADGE: Record<HookEvent, BadgeVariant> = {
  PreToolUse: 'blue',
  PostToolUse: 'purple',
  SessionStart: 'green',
};

// Six-type palette: each dot is a light-dark() pair — the light value is
// the base hue, the dark value one step brighter of the same hue.
const TRIGGER_META: Record<
  TriggerType,
  {dot: string; placeholder: string; hint: string}
> = {
  tool_call: {
    dot: 'light-dark(#3b82f6, #60a5fa)',
    placeholder: 'bash, ipython, edit',
    hint: 'Exact tool names, comma separated.',
  },
  tool_pattern: {
    dot: 'light-dark(#a855f7, #c084fc)',
    placeholder: '\\\\brm -rf\\\\b',
    hint: 'Regex applied to the tool arguments.',
  },
  keyword: {
    dot: 'light-dark(#ec4899, #f472b6)',
    placeholder: 'deploy, rollback',
    hint: 'Words in the prompt or tool output.',
  },
  channel: {
    dot: 'light-dark(#22c55e, #4ade80)',
    placeholder: 'web, teamchat',
    hint: 'Chat surfaces this hook applies to.',
  },
  node: {
    dot: 'light-dark(#f97316, #fb923c)',
    placeholder: 'cli, sandbox',
    hint: 'Runtime nodes this hook applies to.',
  },
  event: {
    dot: 'light-dark(#f59e0b, #fbbf24)',
    placeholder: 'SessionStart',
    hint: 'Extra lifecycle events that evaluate this hook.',
  },
};

const TRIGGER_TYPE_OPTIONS = (
  [
    'tool_call',
    'tool_pattern',
    'keyword',
    'channel',
    'node',
    'event',
  ] as TriggerType[]
).map(type => ({value: type, label: type}));

const RUN_STATUS_META: Record<
  RunStatus,
  {variant: 'success' | 'error' | 'warning' | 'neutral'; label: string}
> = {
  success: {variant: 'success', label: 'Succeeded'},
  error: {variant: 'error', label: 'Failed'},
  timeout: {variant: 'warning', label: 'Timed out'},
  skipped: {variant: 'neutral', label: 'Skipped'},
};

const HOOKS: AgentHook[] = [
  {
    id: 'hk-guard-shell',
    name: 'Guard destructive shell',
    description: 'Blocks rm -rf and disk-wipe commands before they run',
    event: 'PreToolUse',
    matcher: 'bash|ipython',
    onFailure: 'block',
    timeout: '30s',
    version: 'v4',
    triggers: [
      {id: 'g-t1', type: 'tool_call', mode: 'activates', value: 'bash, ipython'},
      {id: 'g-t2', type: 'tool_pattern', mode: 'invokes', value: '\\\\brm -rf\\\\b'},
      {id: 'g-t3', type: 'node', mode: 'activates', value: 'cli, sandbox'},
    ],
    script: \`#!/usr/bin/env bash
# Guard destructive shell — exit 2 blocks the tool call.
payload="$(cat)"
if echo "$payload" | jq -r '.tool_input.command' | grep -Eq '\\\\brm -rf\\\\b'; then
  echo "Blocked: destructive command outside an approved cleanup task" >&2
  exit 2
fi
exit 0\`,
    runs: [
      {id: 'g-r1', status: 'success', duration: '0.21s', when: '4m ago'},
      {id: 'g-r2', status: 'success', duration: '0.19s', when: '12m ago'},
      {id: 'g-r3', status: 'success', duration: '0.24s', when: '41m ago'},
      {id: 'g-r4', status: 'skipped', duration: '0.02s', when: '1h ago'},
      {id: 'g-r5', status: 'success', duration: '0.22s', when: '3h ago'},
    ],
  },
  {
    id: 'hk-secrets-scan',
    name: 'Secrets scan on file writes',
    description: 'Scans edits for API keys and tokens before they land',
    event: 'PreToolUse',
    matcher: 'edit|write',
    onFailure: 'block',
    timeout: '20s',
    version: 'v2',
    errorCount: 3,
    triggers: [
      {id: 's-t1', type: 'tool_call', mode: 'activates', value: 'edit, write'},
      {
        id: 's-t2',
        type: 'tool_pattern',
        mode: 'invokes',
        value: '(sk|ghp|xoxb)-[A-Za-z0-9]{16,}',
      },
    ],
    script: \`#!/usr/bin/env bash
# Secrets scan — refuses writes that embed credential-shaped strings.
payload="$(cat)"
if echo "$payload" | jq -r '.tool_input.content' \\\\
  | grep -Eq '(sk|ghp|xoxb)-[A-Za-z0-9]{16,}'; then
  echo "Blocked: credential-shaped string in file write" >&2
  exit 2
fi
exit 0\`,
    runs: [
      {id: 's-r1', status: 'error', duration: '1.02s', when: '9m ago'},
      {id: 's-r2', status: 'error', duration: '0.98s', when: '26m ago'},
      {id: 's-r3', status: 'success', duration: '0.31s', when: '58m ago'},
      {id: 's-r4', status: 'error', duration: '1.10s', when: '2h ago'},
      {id: 's-r5', status: 'success', duration: '0.29s', when: '5h ago'},
    ],
  },
  {
    id: 'hk-audit-deploy',
    name: 'Audit deploy commands',
    description: 'Appends deploy and rollout commands to the audit log',
    event: 'PostToolUse',
    matcher: 'bash',
    onFailure: 'warn',
    timeout: '10s',
    version: 'v7',
    triggers: [
      {
        id: 'a-t1',
        type: 'tool_pattern',
        mode: 'invokes',
        value: 'deploy|rollout|promote',
      },
      {id: 'a-t2', type: 'channel', mode: 'activates', value: 'web, teamchat'},
    ],
    script: \`#!/usr/bin/env bash
# Audit trail — log only, never blocks.
payload="$(cat)"
cmd="$(echo "$payload" | jq -r '.tool_input.command')"
printf '%s\\\\t%s\\\\n' "$SESSION_ID" "$cmd" >> ~/.foundry/audit.log
exit 0\`,
    runs: [
      {id: 'a-r1', status: 'success', duration: '0.08s', when: '18m ago'},
      {id: 'a-r2', status: 'success', duration: '0.07s', when: '1h ago'},
      {id: 'a-r3', status: 'success', duration: '0.09s', when: '2h ago'},
      {id: 'a-r4', status: 'success', duration: '0.07s', when: 'Yesterday'},
      {id: 'a-r5', status: 'success', duration: '0.08s', when: 'Yesterday'},
    ],
  },
  {
    id: 'hk-restore-memory',
    name: 'Restore workspace memory',
    description: 'Loads the memory index into context when a session starts',
    event: 'SessionStart',
    matcher: '*',
    onFailure: 'warn',
    timeout: '45s',
    version: 'v1',
    triggers: [
      {id: 'm-t1', type: 'event', mode: 'invokes', value: 'SessionStart'},
      {id: 'm-t2', type: 'node', mode: 'activates', value: 'cli, sandbox'},
    ],
    script: \`#!/usr/bin/env bash
# Session boot — surface the memory index as additional context.
if [ -f ~/.foundry/memory/MEMORY.md ]; then
  jq -n --rawfile memo ~/.foundry/memory/MEMORY.md \\\\
    '{additionalContext: $memo}'
fi
exit 0\`,
    runs: [
      {id: 'm-r1', status: 'success', duration: '2.4s', when: '31m ago'},
      {id: 'm-r2', status: 'timeout', duration: '45.0s', when: '3h ago'},
      {id: 'm-r3', status: 'success', duration: '2.1s', when: '6h ago'},
      {id: 'm-r4', status: 'success', duration: '2.6s', when: 'Yesterday'},
      {id: 'm-r5', status: 'success', duration: '2.3s', when: 'Yesterday'},
    ],
  },
  {
    id: 'hk-notify-teamchat',
    name: 'Notify TeamChat on failures',
    description: 'Posts to the on-call TeamChat room when runs go red',
    event: 'PostToolUse',
    matcher: '*',
    onFailure: 'warn',
    timeout: '15s',
    version: 'v3',
    triggers: [
      {
        id: 'n-t1',
        type: 'keyword',
        mode: 'activates',
        value: 'failed, exit code, traceback',
      },
      {id: 'n-t2', type: 'channel', mode: 'invokes', value: 'teamchat'},
    ],
    script: \`#!/usr/bin/env bash
# On-call ping — fire and forget; warn on non-zero.
curl -sf -X POST "$TEAMCHAT_WEBHOOK" \\\\
  -d "{\\\\"room\\\\": \\\\"#oncall\\\\", \\\\"text\\\\": \\\\"Hook alert: $HOOK_NAME\\\\"}" \\\\
  > /dev/null
exit 0\`,
    runs: [
      {id: 'n-r1', status: 'success', duration: '0.64s', when: '22m ago'},
      {id: 'n-r2', status: 'success', duration: '0.71s', when: '1h ago'},
      {id: 'n-r3', status: 'error', duration: '15.0s', when: '4h ago'},
      {id: 'n-r4', status: 'success', duration: '0.66s', when: '7h ago'},
      {id: 'n-r5', status: 'success', duration: '0.69s', when: 'Yesterday'},
    ],
  },
  {
    id: 'hk-pin-node',
    name: 'Pin node for perf runs',
    description: 'Locks perf sessions to the dedicated benchmark node',
    event: 'SessionStart',
    matcher: 'perf-*',
    onFailure: 'block',
    timeout: '30s',
    version: 'v1',
    triggers: [
      {id: 'p-t1', type: 'event', mode: 'activates', value: 'SessionStart'},
      {id: 'p-t2', type: 'keyword', mode: 'invokes', value: 'perf, benchmark'},
      {id: 'p-t3', type: 'node', mode: 'activates', value: 'benchmark-01'},
    ],
    script: \`#!/usr/bin/env bash
# Perf isolation — refuse to start on shared nodes.
if [ "$NODE_NAME" != "benchmark-01" ]; then
  echo "Blocked: perf sessions must run on benchmark-01" >&2
  exit 2
fi
exit 0\`,
    runs: [
      {id: 'p-r1', status: 'skipped', duration: '0.01s', when: '2h ago'},
      {id: 'p-r2', status: 'skipped', duration: '0.01s', when: '5h ago'},
      {id: 'p-r3', status: 'success', duration: '0.12s', when: 'Yesterday'},
      {id: 'p-r4', status: 'error', duration: '0.14s', when: 'Yesterday'},
      {id: 'p-r5', status: 'success', duration: '0.11s', when: 'Jul 10'},
    ],
  },
  {
    id: 'hk-flag-output',
    name: 'Flag oversized tool output',
    description: 'Warns when a single tool result would flood the context',
    event: 'PostToolUse',
    matcher: 'bash|browser',
    onFailure: 'warn',
    timeout: '10s',
    version: 'v5',
    triggers: [
      {id: 'f-t1', type: 'tool_call', mode: 'activates', value: 'bash, browser'},
      {id: 'f-t2', type: 'channel', mode: 'activates', value: 'web'},
    ],
    script: \`#!/usr/bin/env bash
# Context hygiene — warn past ~24k characters of output.
size="$(cat | jq -r '.tool_output' | wc -c)"
if [ "$size" -gt 24000 ]; then
  echo "Warning: tool result is $size chars; consider piping to a file" >&2
  exit 1
fi
exit 0\`,
    runs: [
      {id: 'f-r1', status: 'success', duration: '0.05s', when: '6m ago'},
      {id: 'f-r2', status: 'success', duration: '0.05s', when: '19m ago'},
      {id: 'f-r3', status: 'success', duration: '0.06s', when: '47m ago'},
      {id: 'f-r4', status: 'success', duration: '0.05s', when: '1h ago'},
      {id: 'f-r5', status: 'success', duration: '0.06s', when: '2h ago'},
    ],
  },
];

// "Pin node for perf runs" ships with its switch off.
const ENABLED_SEED: Record<string, boolean> = {
  'hk-guard-shell': true,
  'hk-secrets-scan': true,
  'hk-audit-deploy': true,
  'hk-restore-memory': true,
  'hk-notify-teamchat': true,
  'hk-pin-node': false,
  'hk-flag-output': true,
};

const NEW_HOOK_SCRIPT = \`#!/usr/bin/env bash
# New hook — read the event payload from stdin and exit:
#   0 = allow · 1 = warn · 2 = block
exit 0\`;

// ============= SMALL PIECES =============

function TypeDot({type}: {type: TriggerType}) {
  return (
    <span
      style={{...styles.typeDot, backgroundColor: TRIGGER_META[type].dot}}
      aria-hidden
    />
  );
}

/**
 * One editable trigger row: colored type dot, type Selector, a mode chip
 * that toggles activates/invokes on click, and the value input with a
 * per-type CSV placeholder. The row wraps so the input never squeezes.
 */
function TriggerEditorRow({
  trigger,
  onChange,
  onRemove,
}: {
  trigger: TriggerRow;
  onChange: (next: TriggerRow) => void;
  onRemove: () => void;
}) {
  const meta = TRIGGER_META[trigger.type];
  const isActivates = trigger.mode === 'activates';
  return (
    <div style={styles.triggerRow}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center" style={styles.triggerRowWrap}>
          <TypeDot type={trigger.type} />
          <div style={styles.typeSelectorCell}>
            <Selector
              label="Trigger type"
              isLabelHidden
              size="sm"
              options={TRIGGER_TYPE_OPTIONS}
              value={trigger.type}
              onChange={value =>
                onChange({...trigger, type: value as TriggerType})
              }
            />
          </div>
          {/* Mode chip: amber = activates (arms the hook), blue = invokes
              (runs the script directly); click flips it. */}
          <Token
            label={trigger.mode}
            size="sm"
            color={isActivates ? 'yellow' : 'blue'}
            onClick={() =>
              onChange({...trigger, mode: isActivates ? 'invokes' : 'activates'})
            }
          />
          <div style={styles.valueCell}>
            <TextInput
              label={\`\${trigger.type} value\`}
              isLabelHidden
              size="sm"
              placeholder={meta.placeholder}
              value={trigger.value}
              onChange={value => onChange({...trigger, value})}
            />
          </div>
          <IconButton
            label="Remove trigger"
            tooltip="Remove trigger"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={onRemove}
          />
        </HStack>
        <Text type="supporting" color="secondary">
          {meta.hint}
        </Text>
      </VStack>
    </div>
  );
}

function RunPill({run}: {run: HookRun}) {
  const meta = RUN_STATUS_META[run.status];
  return (
    <HStack gap={2} vAlign="center" style={styles.runPill}>
      <StatusDot variant={meta.variant} label={meta.label} />
      <Text type="code" size="sm" hasTabularNumbers>
        {run.duration}
      </Text>
      <Text type="supporting" color="secondary">
        {run.when}
      </Text>
    </HStack>
  );
}

// ============= PAGE =============

export default function AgentHooksAutomationTemplate() {
  const [hooks, setHooks] = useState(HOOKS);
  const [selectedId, setSelectedId] = useState('hk-secrets-scan');
  const [query, setQuery] = useState('');
  const [enabled, setEnabled] = useState(ENABLED_SEED);
  const [nextId, setNextId] = useState(1);

  // Responsive: measure the page, not the viewport (demo stage quirk).
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 860;

  const selected = hooks.find(hook => hook.id === selectedId) ?? hooks[0];
  const enabledCount = hooks.filter(hook => enabled[hook.id]).length;

  const visibleHooks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') {
      return hooks;
    }
    return hooks.filter(
      hook =>
        hook.name.toLowerCase().includes(needle) ||
        hook.description.toLowerCase().includes(needle) ||
        hook.event.toLowerCase().includes(needle),
    );
  }, [hooks, query]);

  const hookOptions = hooks.map(hook => ({value: hook.id, label: hook.name}));

  const toggleHook = (id: string, value: boolean) => {
    setEnabled(prev => ({...prev, [id]: value}));
  };

  const updateTrigger = (hookId: string, next: TriggerRow) => {
    setHooks(prev =>
      prev.map(hook =>
        hook.id === hookId
          ? {
              ...hook,
              triggers: hook.triggers.map(row =>
                row.id === next.id ? next : row,
              ),
            }
          : hook,
      ),
    );
  };

  const removeTrigger = (hookId: string, triggerId: string) => {
    setHooks(prev =>
      prev.map(hook =>
        hook.id === hookId
          ? {...hook, triggers: hook.triggers.filter(row => row.id !== triggerId)}
          : hook,
      ),
    );
  };

  const addTrigger = (hookId: string) => {
    setHooks(prev =>
      prev.map(hook =>
        hook.id === hookId
          ? {
              ...hook,
              triggers: [
                ...hook.triggers,
                {
                  id: \`new-t\${nextId}\`,
                  type: 'keyword',
                  mode: 'activates',
                  value: '',
                },
              ],
            }
          : hook,
      ),
    );
    setNextId(prev => prev + 1);
  };

  // New hooks start disabled with an empty run history.
  const addHook = () => {
    const id = \`hk-new-\${nextId}\`;
    setHooks(prev => [
      ...prev,
      {
        id,
        name: \`Untitled hook \${nextId}\`,
        description: 'Describe what this hook gates or observes',
        event: 'PreToolUse',
        matcher: '*',
        onFailure: 'warn',
        timeout: '30s',
        version: 'v1',
        triggers: [],
        script: NEW_HOOK_SCRIPT,
        runs: [],
      },
    ]);
    setEnabled(prev => ({...prev, [id]: false}));
    setSelectedId(id);
    setNextId(prev => prev + 1);
  };

  const hookList = (
    <List density="compact" hasDividers>
      {visibleHooks.map(hook => (
        <ListItem
          key={hook.id}
          label={
            <HStack gap={2} vAlign="center">
              <Text type="label">{hook.name}</Text>
              <Badge label={hook.event} variant={EVENT_BADGE[hook.event]} />
              {hook.errorCount != null && (
                <Tooltip
                  content={\`\${hook.errorCount} failed runs in the last 24 hours\`}>
                  <Badge label={\`\${hook.errorCount} errors\`} variant="error" />
                </Tooltip>
              )}
            </HStack>
          }
          description={hook.description}
          endContent={
            <div style={styles.miniSwitch}>
              <Switch
                label={\`Enable \${hook.name}\`}
                isLabelHidden
                value={enabled[hook.id] ?? false}
                onChange={value => toggleHook(hook.id, value)}
              />
            </div>
          }
          onClick={() => setSelectedId(hook.id)}
          isSelected={hook.id === selected.id}
        />
      ))}
    </List>
  );

  const detail = (
    <VStack gap={5} style={styles.detailColumn}>
      {isCompact && (
        <div style={styles.narrowSelectorRow}>
          <Selector
            label="Hook"
            isLabelHidden
            options={hookOptions}
            value={selected.id}
            onChange={setSelectedId}
          />
        </div>
      )}

      {/* ---- Heading + metadata grid ---- */}
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Heading level={2}>{selected.name}</Heading>
          <Badge
            label={selected.event}
            variant={EVENT_BADGE[selected.event]}
          />
          {!enabled[selected.id] && <Badge label="disabled" variant="warning" />}
          {/* The rail rows own the Switch on wide layouts; when the rail
              collapses the toggle moves here. */}
          {isCompact && (
            <>
              <StackItem size="fill" />
              <Switch
                label={\`Enable \${selected.name}\`}
                isLabelHidden
                value={enabled[selected.id] ?? false}
                onChange={value => toggleHook(selected.id, value)}
              />
            </>
          )}
        </HStack>
        <Text type="supporting" color="secondary">
          {selected.description}
        </Text>
      </VStack>

      <MetadataList
        columns={isCompact ? 'multi' : 2}
        label={{position: 'start', width: 80}}>
        <MetadataListItem label="Event">
          <Code>{selected.event}</Code>
        </MetadataListItem>
        <MetadataListItem label="Matcher">
          <Code>{selected.matcher}</Code>
        </MetadataListItem>
        <MetadataListItem label="On failure">
          <Badge
            label={selected.onFailure}
            variant={selected.onFailure === 'block' ? 'error' : 'warning'}
          />
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
          <Text type="label" color="secondary" style={styles.eyebrow}>
            Triggers
          </Text>
          <Text type="supporting" color="secondary">
            {selected.triggers.length === 0
              ? 'none — matches every event'
              : \`\${selected.triggers.length} row\${
                  selected.triggers.length === 1 ? '' : 's'
                } · all must match\`}
          </Text>
          <StackItem size="fill" />
          <Button
            label="Add trigger"
            variant="secondary"
            size="sm"
            icon={<Icon icon={PlusIcon} size="sm" />}
            onClick={() => addTrigger(selected.id)}
          />
        </HStack>
        {selected.triggers.length > 0 && (
          <VStack gap={2}>
            {selected.triggers.map(trigger => (
              <TriggerEditorRow
                key={trigger.id}
                trigger={trigger}
                onChange={next => updateTrigger(selected.id, next)}
                onRemove={() => removeTrigger(selected.id, trigger.id)}
              />
            ))}
          </VStack>
        )}
      </VStack>

      <Divider />

      {/* ---- Hook script ---- */}
      <VStack gap={2}>
        <Text type="label" color="secondary" style={styles.eyebrow}>
          Hook script
        </Text>
        <CodeBlock
          code={selected.script}
          language="bash"
          size="sm"
          width="100%"
          maxHeight={260}
          hasCopyButton
        />
      </VStack>

      {/* ---- Run history strip ---- */}
      <VStack gap={2}>
        <Text type="label" color="secondary" style={styles.eyebrow}>
          Run history · last 5
        </Text>
        {selected.runs.length === 0 ? (
          <div style={styles.emptyRuns}>
            <Text type="supporting" color="secondary">
              No runs yet — this hook fires once it is enabled.
            </Text>
          </div>
        ) : (
          <HStack gap={2} style={styles.runStrip}>
            {selected.runs.map(run => (
              <RunPill key={run.id} run={run} />
            ))}
          </HStack>
        )}
      </VStack>
    </VStack>
  );

  return (
    <div ref={wrapRef} style={{height: '100%'}}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={1}>
                  <Heading level={1}>Agent hooks</Heading>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {\`Lifecycle automation for \${PRODUCT_NAME} · \${hooks.length} hooks · \${enabledCount} enabled\`}
                  </Text>
                </VStack>
              </StackItem>
              <Button
                label="New hook"
                size="sm"
                icon={<Icon icon={PlusIcon} size="sm" />}
                onClick={addHook}
              />
            </HStack>
          </LayoutHeader>
        }
        start={
          isCompact ? undefined : (
            <LayoutPanel width={300} padding={0} hasDivider label="Hook list">
              <div style={styles.railScroll}>
                <div style={styles.railSearch}>
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
                {hookList}
              </div>
            </LayoutPanel>
          )
        }
        content={<LayoutContent>{detail}</LayoutContent>}
      />
    </div>
  );
}
`;export{e as default};