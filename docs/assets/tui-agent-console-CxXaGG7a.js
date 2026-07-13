var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (12 sessions across four folders with
 *   pinned/processing/archived states and fixed compact times; per-session
 *   chat metadata — model name, node badge, context percentage; four
 *   authored transcripts plus a deterministic fallback; a fixed cycle of
 *   processing verbs)
 * @output Flagship terminal agent console: a full-window dark monospace TUI
 *   stage centered on a token backdrop — left Sessions pane (~34%, green
 *   border when focused) with collapsible folder headers, unread dot,
 *   pinned/processing glyphs, right-aligned compact times, and a
 *   white-on-blue cursor row; right Chat pane whose border title carries
 *   the session name + model, a node badge, and a 20-char block context
 *   meter (green, yellow past 70%); transcript with right-aligned bordered
 *   user bubbles, markdown-ish assistant text, an expandable tool-call box
 *   (yellow name, gray preview, green check + duration, cyan command, dim
 *   truncation line), a collapsed tool-group header, a yellow compaction
 *   divider, a processing row cycling verbs on a 2s interval, and a queued
 *   steering pill; bordered input box and a 1-row key-hint status bar with
 *   a yellow update chip
 * @position Page template; emitted by \`astryx template tui-agent-console\`
 *
 * Frame: no Layout shell — the TUI stage is a fixed dark surface (bg
 * #0d1117, mono stack, colorScheme 'dark' pinned) centered on a
 * var(--color-background-muted) backdrop with a Text caption row beneath,
 * so the template reads correctly inside light demo chrome. Panes are CSS
 * borders + border-radius with titles inset into the top border; literal
 * glyphs (❯ ▸ ▾ ● ✓ ↺ › 📌 ↵) live inside the text only.
 *
 * Responsive contract (useElementWidth — viewport media queries never fire
 * in the inline demo stage):
 * - >780px: Sessions pane (34%, minWidth 264) beside the Chat pane; status
 *   bar shows all five key hints; the chat border title keeps the node
 *   badge next to the context meter.
 * - <=780px: the Sessions pane is hidden (chat pane fills the stage), the
 *   node badge drops from the border title (the meter stays), and the
 *   status bar trims to the first three key hints.
 *
 * Interactivity: clicking a pane moves focus (green border). Sessions pane
 * supports ArrowUp/ArrowDown to move the white-on-blue cursor and Enter to
 * open (click does both); opening a session swaps the transcript, border
 * title, node badge, and meter. Folder headers collapse/expand. The tool
 * box and tool-group header expand/collapse. Typing in the input works;
 * Enter appends the draft to the current session's transcript.
 *
 * Color policy: the stage is a scheme-locked terminal surface — every color
 * on it is an intentional raw literal from the batch terminal palette and
 * must NOT be converted to theme tokens. Only the backdrop and caption use
 * Astryx tokens/components.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react';

import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

// ============= RESPONSIVE HELPER =============
// The demo renders pages in an inline ~1045-1075px stage, so viewport
// media queries never fire there; measure our own width instead.

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

// ============= TERMINAL PALETTE =============
// Fixed dark palette — real terminals are dark in both themes.

const T = {
  bg: '#0d1117',
  panel: '#161b22',
  border: '#30363d',
  text: '#e6edf3',
  dim: '#8b949e',
  green: '#3fb950',
  yellow: '#d29922',
  red: '#f85149',
  cyan: '#39c5cf',
  blue: '#58a6ff',
  magenta: '#bc8cff',
  selectionBg: '#1f6feb',
} as const;

const KEYFRAMES = \`
@keyframes tuiPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Token backdrop so the dark stage reads inside light demo chrome.
  backdrop: {
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6)',
  },
  centerColumn: {
    margin: 'auto',
    width: '100%',
    maxWidth: 1240,
  },
  stage: {
    colorScheme: 'dark',
    backgroundColor: T.bg,
    border: \`1px solid \${T.border}\`,
    borderRadius: 12,
    height: 660,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 13,
    lineHeight: 1.55,
    color: T.text,
    overflow: 'hidden',
  },
  paneRow: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    gap: 10,
    padding: '14px 12px 8px',
  },
  // Pane chrome: CSS border + radius, title inset into the top border.
  pane: {
    position: 'relative',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
  },
  paneTitle: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: T.bg,
    paddingInline: 6,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  paneTitleRight: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: T.bg,
    paddingInline: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    whiteSpace: 'pre',
  },
  sessionsPane: {width: '34%', minWidth: 264, flexShrink: 0},
  sessionsScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '12px 8px 8px',
  },
  chatPane: {flex: 1},
  transcript: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '14px 14px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  // Reset for clickable text rows (folder headers, tool headers).
  ghostButton: {
    background: 'transparent',
    border: 'none',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'left',
    padding: 0,
    cursor: 'pointer',
    width: '100%',
  },
  folderHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 8px',
  },
  sessionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 8px',
    borderRadius: 4,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  sessionTitle: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '78%',
    backgroundColor: T.panel,
    border: \`1px solid \${T.border}\`,
    borderRadius: 8,
    padding: '6px 12px',
  },
  assistantBlock: {maxWidth: '92%'},
  toolBox: {
    backgroundColor: T.panel,
    border: \`1px solid \${T.border}\`,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toolHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
  },
  toolBody: {
    borderTop: \`1px solid \${T.border}\`,
    padding: '8px 12px',
    whiteSpace: 'pre-wrap',
  },
  compactionLine: {flex: 1, borderTop: \`1px solid \${T.border}\`},
  queuedPill: {
    alignSelf: 'flex-start',
    border: \`1px dashed \${T.border}\`,
    borderRadius: 999,
    padding: '3px 12px',
    color: T.dim,
    fontStyle: 'italic',
  },
  inputArea: {padding: '4px 14px 12px'},
  inputBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: \`1px solid \${T.border}\`,
    borderRadius: 8,
    backgroundColor: T.panel,
    padding: '8px 12px',
  },
  inputField: {
    flex: 1,
    minWidth: 0,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    font: 'inherit',
    color: T.text,
    padding: 0,
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '5px 16px',
    borderTop: \`1px solid \${T.border}\`,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  pulse: {animation: 'tuiPulse 2s ease-in-out infinite'},
};

// ============= DATA =============
// Deterministic fixtures: fixed compact times, no clocks, no randomness.

const WORKSPACE = 'Atlas';
const PRODUCT_VERSION = 'v1.2.3';

interface Session {
  id: string;
  title: string;
  time: string; // compact display time — \`14:32\` today, \`7/12 09:15\` older
  isPinned?: boolean;
  isProcessing?: boolean;
}

interface Folder {
  id: string;
  name: string;
  hasUnread?: boolean;
  isArchived?: boolean;
  sessions: Session[];
}

const FOLDERS: Folder[] = [
  {
    id: 'f-deploys',
    name: 'Deploys',
    hasUnread: true,
    sessions: [
      {
        id: 's-flaky',
        title: 'fix flaky deploy checks',
        time: '14:32',
        isProcessing: true,
      },
      {id: 's-canary', title: 'canary rollout plan', time: '11:05', isPinned: true},
      {id: 's-rollback', title: 'rollback playbook audit', time: '7/12 09:15'},
      {id: 's-cert', title: 'staging cert renewal', time: '7/11 16:40'},
    ],
  },
  {
    id: 'f-research',
    name: 'Research',
    sessions: [
      {
        id: 's-bench',
        title: 'vector cache benchmarks',
        time: '13:58',
        isProcessing: true,
      },
      {id: 's-rfc', title: 'summarize infra RFC-118', time: '7/12 18:22'},
      {id: 's-queue', title: 'compare queue libraries', time: '7/10 08:03'},
    ],
  },
  {
    id: 'f-ops',
    name: 'Ops',
    sessions: [
      {
        id: 's-pager',
        title: 'rotate on-call schedule',
        time: '7/12 07:45',
        isPinned: true,
      },
      {id: 's-disk', title: 'disk alert triage — db-04', time: '12:10'},
    ],
  },
  {
    id: 'f-archived',
    name: 'Archived',
    isArchived: true,
    sessions: [
      {id: 's-arch-1', title: 'migrate CI to blaze runners', time: '6/28 15:12'},
      {id: 's-arch-2', title: 'sunset legacy webhooks', time: '6/24 10:30'},
      {id: 's-arch-3', title: 'q2 infra cost review', time: '6/19 17:05'},
    ],
  },
];

const SESSION_COUNT = FOLDERS.reduce(
  (sum, folder) => sum + folder.sessions.length,
  0,
);

const ALL_SESSIONS: Session[] = FOLDERS.flatMap(folder => folder.sessions);

interface ChatMeta {
  model: string;
  nodes: string; // node badge label, e.g. \`laptop +2\`
  contextPct: number; // 20-char meter; fill turns yellow past 70
}

const CHAT_META: Record<string, ChatMeta> = {
  's-flaky': {model: 'Relay Ultra', nodes: 'laptop +2', contextPct: 42},
  's-canary': {model: 'Relay Ultra', nodes: 'laptop +1', contextPct: 71},
  's-bench': {model: 'Relay Ultra', nodes: 'devvm-12 +1', contextPct: 78},
  's-disk': {model: 'Relay Swift', nodes: 'devvm-04', contextPct: 23},
};

const DEFAULT_META: ChatMeta = {
  model: 'Relay Swift',
  nodes: 'laptop',
  contextPct: 12,
};

// Processing verbs cycled on a 2s interval, deterministic order.
const PROCESS_WORDS = [
  'pondering',
  'noodling',
  'consulting the oracle',
  'summoning neurons',
];

type TranscriptItem =
  | {kind: 'user'; text: string; time: string}
  // Lines starting with "- " render as dim-bulleted markdown-ish rows.
  | {kind: 'assistant'; lines: string[]}
  | {
      kind: 'tool';
      name: string;
      preview: string;
      duration: string;
      command: string;
      output: string[];
      more?: string;
    }
  | {
      kind: 'group';
      label: string;
      rows: Array<{name: string; preview: string; duration: string}>;
    }
  | {kind: 'compaction'}
  | {kind: 'processing'}
  | {kind: 'queued'; text: string};

const TRANSCRIPTS: Record<string, TranscriptItem[]> = {
  's-flaky': [
    {
      kind: 'user',
      text: 'The deploy verification suite is flaky again — 3 of the last 5 runs failed on checks that pass locally. Can you dig in?',
      time: '14:02',
    },
    {
      kind: 'assistant',
      lines: [
        'Pulled the last five verification runs. Two failures are the same timeout in wait-for-canary; one is a 502 from the artifact cache. Reproducing in the runner sandbox now.',
      ],
    },
    {
      kind: 'tool',
      name: 'bash',
      preview: 'ls -la',
      duration: '1.5s',
      command: '$ ls -la',
      output: [
        'total 96',
        'drwxr-xr-x  14 relay  staff   448 Jul 12 14:03 .',
        '-rw-r--r--   1 relay  staff  2841 Jul 12 14:03 deploy-checks.yml',
      ],
      more: '  ... (14 more lines)',
    },
    {
      kind: 'assistant',
      lines: [
        'Two separate causes:',
        '- wait-for-canary times out because the canary pod now takes ~90s to become Ready, but the check gives up at 60s',
        '- the artifact cache 502s only when the runner pool scales up from zero (cold cache node)',
        'The timings from the junit output confirm both.',
      ],
    },
    {
      kind: 'group',
      label: '3 tool calls — bash, ipython, edit',
      rows: [
        {name: 'bash', preview: 'gh run view 8841 --log-failed', duration: '0.8s'},
        {name: 'ipython', preview: 'parse junit timings', duration: '1.2s'},
        {
          name: 'edit',
          preview: '.github/workflows/deploy-checks.yml',
          duration: '0.4s',
        },
      ],
    },
    {kind: 'compaction'},
    {
      kind: 'user',
      text: 'Bump the canary timeout to 180s and add a retry on the cache fetch.',
      time: '14:28',
    },
    {kind: 'processing'},
    {kind: 'queued', text: 'also update the runbook'},
  ],
  's-canary': [
    {
      kind: 'user',
      text: 'Draft the canary rollout plan for the payments service — 5% for an hour, then 25%, then full.',
      time: '10:41',
    },
    {
      kind: 'assistant',
      lines: [
        'Plan drafted with three gates:',
        '- 5% for 60m — abort if p99 latency regresses >8% or error rate >0.2%',
        '- 25% for 30m — same gates plus a manual approval from #payments-oncall',
        '- 100% — auto-rollback armed for 24h',
        'Wrote it into deploy/canary-plan.md and wired the gate thresholds into the rollout config.',
      ],
    },
    {
      kind: 'group',
      label: '2 tool calls — bash, edit',
      rows: [
        {name: 'bash', preview: 'git log --oneline -5 deploy/', duration: '0.3s'},
        {name: 'edit', preview: 'deploy/canary-plan.md', duration: '0.6s'},
      ],
    },
    {
      kind: 'assistant',
      lines: [
        'Ready for review — say "ship it" and I will open the PR against release/2026-07.',
      ],
    },
  ],
  's-bench': [
    {
      kind: 'user',
      text: 'Benchmark the vector cache with 64 and 128 shard configs — same corpus as last week.',
      time: '13:41',
    },
    {
      kind: 'assistant',
      lines: [
        'Corpus restored from the 7/6 snapshot. Running the 64-shard pass first; 128 queued behind it. Early numbers put 64-shard p50 at 11ms.',
      ],
    },
    {kind: 'processing'},
  ],
  's-disk': [
    {
      kind: 'user',
      text: 'db-04 fired a disk usage alert at 92% — triage?',
      time: '12:04',
    },
    {
      kind: 'tool',
      name: 'bash',
      preview: 'df -h /var/lib/postgres',
      duration: '0.4s',
      command: '$ df -h /var/lib/postgres',
      output: [
        'Filesystem      Size  Used Avail Use% Mounted on',
        '/dev/nvme1n1    1.8T  1.6T  144G  92% /var/lib/postgres',
        'pg_wal          210G  —     —     —   (in Used above)',
      ],
      more: '  ... (6 more lines)',
    },
    {
      kind: 'assistant',
      lines: [
        'Root cause: WAL retention.',
        '- a stalled replication slot (analytics_replica) is pinning 210G of WAL segments',
        '- dropping the stale slot and forcing a checkpoint frees the space safely',
        'Want me to drop the slot? The analytics replica was decommissioned on 7/2.',
      ],
    },
  ],
};

// Sessions without an authored transcript get a deterministic resume stub.
function fallbackTranscript(session: Session): TranscriptItem[] {
  return [
    {
      kind: 'user',
      text: \`Pick this back up — where did we land on \${session.title}?\`,
      time: session.time,
    },
    {
      kind: 'assistant',
      lines: [
        \`Recap of \${session.title}: the last run finished clean and notes are saved to memory/\${session.id}.md. Nothing is blocked on you — tell me the next step and I will take it from there.\`,
      ],
    },
  ];
}

const STATUS_KEYS: Array<[string, string]> = [
  ['↵', 'send'],
  ['Esc', 'scroll'],
  ['ctrl+o', 'actions'],
  ['Tab', 'messages'],
  ['?', 'help'],
];

// ============= SMALL PIECES =============

function ContextMeter({pct}: {pct: number}) {
  const filled = Math.round(pct / 5);
  const fillColor = pct > 70 ? T.yellow : T.green;
  return (
    <span style={{whiteSpace: 'pre'}} aria-label={\`Context \${pct}% used\`}>
      <span style={{color: fillColor}}>{'█'.repeat(filled)}</span>
      <span style={{color: T.border}}>{'░'.repeat(20 - filled)}</span>
      <span style={{color: T.dim}}> {pct}%</span>
    </span>
  );
}

/** Tool-call box: bordered header (name, preview, check, duration) over a
 * divider + body with completed line, cyan command, output, truncation. */
function ToolBox({
  item,
}: {
  item: Extract<TranscriptItem, {kind: 'tool'}>;
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div style={styles.toolBox}>
      <button
        type="button"
        style={{...styles.ghostButton, ...styles.toolHeader}}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(prev => !prev)}>
        <span style={{color: T.dim}}>{isOpen ? '▾' : '▸'}</span>
        <span style={{color: T.yellow}}>{item.name}</span>
        <span
          style={{
            color: T.dim,
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
          {item.preview}
        </span>
        <span style={{color: T.green}}>✓</span>
        <span style={{color: T.dim}}>{item.duration}</span>
      </button>
      {isOpen && (
        <div style={styles.toolBody}>
          <div style={{color: T.green}}>✓ completed</div>
          <div style={{color: T.cyan}}>{item.command}</div>
          {item.output.map(line => (
            <div key={line}>{line}</div>
          ))}
          {item.more != null && <div style={{color: T.dim}}>{item.more}</div>}
        </div>
      )}
    </div>
  );
}

/** Collapsed tool-group header: \`▸ 3 tool calls — …  ✓\`; expands to rows. */
function ToolGroup({
  item,
}: {
  item: Extract<TranscriptItem, {kind: 'group'}>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        style={{...styles.ghostButton, display: 'flex', gap: 8}}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(prev => !prev)}>
        <span style={{color: T.dim}}>{isOpen ? '▾' : '▸'}</span>
        <span style={{color: T.dim}}>{item.label}</span>
        <span style={{color: T.green}}>✓</span>
      </button>
      {isOpen && (
        <div style={{paddingLeft: 20, paddingTop: 2}}>
          {item.rows.map(row => (
            <div key={row.preview} style={{display: 'flex', gap: 8}}>
              <span style={{color: T.green}}>✓</span>
              <span style={{color: T.yellow}}>{row.name}</span>
              <span
                style={{
                  color: T.dim,
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                {row.preview}
              </span>
              <span style={{color: T.dim}}>{row.duration}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============= PAGE =============

export default function TuiAgentConsoleTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 780;

  const [focusedPane, setFocusedPane] = useState<'sessions' | 'chat'>(
    'sessions',
  );
  // Active session (❯, transcript shown) vs cursor row (white-on-blue):
  // they start apart so both marker states are visible, and merge on click.
  const [activeId, setActiveId] = useState('s-flaky');
  const [cursorId, setCursorId] = useState('s-canary');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'f-deploys': true,
    'f-research': true,
    'f-ops': true,
    'f-archived': false,
  });
  const [draft, setDraft] = useState('');
  // Messages typed into the input, appended per session.
  const [sentMessages, setSentMessages] = useState<Record<string, string[]>>(
    {},
  );
  const [wordIndex, setWordIndex] = useState(0);

  // Deterministic 2s verb cycle for the processing row.
  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex(prev => (prev + 1) % PROCESS_WORDS.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const activeSession =
    ALL_SESSIONS.find(session => session.id === activeId) ?? ALL_SESSIONS[0];
  const meta = CHAT_META[activeId] ?? DEFAULT_META;
  const transcript =
    TRANSCRIPTS[activeId] ?? fallbackTranscript(activeSession);
  const sent = sentMessages[activeId] ?? [];

  const visibleSessions = FOLDERS.flatMap(folder =>
    openFolders[folder.id] === true ? folder.sessions : [],
  );

  const openSession = (id: string) => {
    setCursorId(id);
    setActiveId(id);
  };

  const onSessionsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const index = visibleSessions.findIndex(
        session => session.id === cursorId,
      );
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next =
        visibleSessions[
          Math.min(Math.max(index + delta, 0), visibleSessions.length - 1)
        ];
      if (next != null) {
        setCursorId(next.id);
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      setActiveId(cursorId);
    }
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (text.length === 0) {
      return;
    }
    setSentMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), text],
    }));
    setDraft('');
  };

  const sessionsFocused = focusedPane === 'sessions' && !isCompact;
  const chatFocused = focusedPane === 'chat' || isCompact;

  const renderTranscriptItem = (item: TranscriptItem, index: number) => {
    switch (item.kind) {
      case 'user':
        return (
          <div key={index} style={styles.userBubble}>
            <div style={{whiteSpace: 'pre-wrap'}}>{item.text}</div>
            <div style={{color: T.dim, textAlign: 'right', fontSize: 11}}>
              {item.time}
            </div>
          </div>
        );
      case 'assistant':
        return (
          <div key={index} style={styles.assistantBlock}>
            {item.lines.map(line =>
              line.startsWith('- ') ? (
                <div key={line} style={{display: 'flex', gap: 8}}>
                  <span style={{color: T.dim}}>•</span>
                  <span>{line.slice(2)}</span>
                </div>
              ) : (
                <div key={line} style={{whiteSpace: 'pre-wrap'}}>
                  {line}
                </div>
              ),
            )}
          </div>
        );
      case 'tool':
        return <ToolBox key={index} item={item} />;
      case 'group':
        return <ToolGroup key={index} item={item} />;
      case 'compaction':
        return (
          <div
            key={index}
            style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <div style={styles.compactionLine} />
            <span style={{color: T.yellow}}>↺ context compacted</span>
            <div style={styles.compactionLine} />
          </div>
        );
      case 'processing':
        return (
          <div key={index} style={{display: 'flex', gap: 8}}>
            <span style={{...styles.pulse, color: T.yellow}}>●</span>
            <span>
              {PROCESS_WORDS[wordIndex]}...
              <span style={{color: T.dim}}>(ctrl+x to stop)</span>
            </span>
          </div>
        );
      case 'queued':
        return (
          <div key={index} style={{...styles.queuedPill, whiteSpace: 'pre-wrap'}}>
            {\`› \${item.text}  ↻ queued\`}
          </div>
        );
    }
  };

  return (
    <div ref={wrapRef} style={styles.backdrop}>
      <style>{KEYFRAMES}</style>
      <div style={styles.centerColumn}>
        <VStack gap={3}>
          <div style={styles.stage}>
            <div style={styles.paneRow}>
              {/* ===== Sessions pane ===== */}
              {!isCompact && (
                <div
                  role="listbox"
                  aria-label={\`Sessions in \${WORKSPACE}\`}
                  aria-activedescendant={\`tui-session-\${cursorId}\`}
                  tabIndex={0}
                  style={{
                    ...styles.pane,
                    ...styles.sessionsPane,
                    border: \`1px solid \${sessionsFocused ? T.green : T.border}\`,
                  }}
                  onClick={() => setFocusedPane('sessions')}
                  onKeyDown={onSessionsKeyDown}>
                  <span
                    style={{
                      ...styles.paneTitle,
                      color: sessionsFocused ? T.green : T.dim,
                    }}>
                    {\` Sessions (\${SESSION_COUNT}) — \${WORKSPACE} \`}
                  </span>
                  <div style={styles.sessionsScroll}>
                    {FOLDERS.map(folder => {
                      const isOpen = openFolders[folder.id] === true;
                      return (
                        <div key={folder.id}>
                          <button
                            type="button"
                            style={{...styles.ghostButton, ...styles.folderHeader}}
                            aria-expanded={isOpen}
                            onClick={() =>
                              setOpenFolders(prev => ({
                                ...prev,
                                [folder.id]: !isOpen,
                              }))
                            }>
                            <span
                              style={{
                                color: folder.isArchived ? T.dim : T.cyan,
                              }}>
                              {isOpen ? '▾' : '▸'}{' '}
                              {\`\${folder.name} (\${folder.sessions.length})\`}
                            </span>
                            {folder.hasUnread === true && (
                              <span style={{color: T.yellow}}>●</span>
                            )}
                          </button>
                          {isOpen &&
                            folder.sessions.map(session => {
                              const isCursor = session.id === cursorId;
                              const isActive = session.id === activeId;
                              return (
                                <div
                                  key={session.id}
                                  id={\`tui-session-\${session.id}\`}
                                  role="option"
                                  aria-selected={isActive}
                                  style={{
                                    ...styles.sessionRow,
                                    backgroundColor: isCursor
                                      ? T.selectionBg
                                      : 'transparent',
                                    color: isCursor
                                      ? '#ffffff'
                                      : folder.isArchived
                                        ? T.dim
                                        : T.text,
                                  }}
                                  onClick={() => openSession(session.id)}>
                                  <span
                                    style={{
                                      width: 12,
                                      flexShrink: 0,
                                      color: isCursor ? '#ffffff' : T.cyan,
                                    }}>
                                    {isActive ? '❯' : ' '}
                                  </span>
                                  {session.isPinned === true && (
                                    <span style={{fontSize: 11}}>📌</span>
                                  )}
                                  <span style={styles.sessionTitle}>
                                    {session.title}
                                  </span>
                                  {session.isProcessing === true && (
                                    <span
                                      style={{...styles.pulse, color: T.yellow}}>
                                      ●
                                    </span>
                                  )}
                                  <span
                                    style={{
                                      color: isCursor ? '#c9d9f5' : T.dim,
                                      fontSize: 11,
                                      fontVariantNumeric: 'tabular-nums',
                                    }}>
                                    {session.time}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ===== Chat pane ===== */}
              <div
                style={{
                  ...styles.pane,
                  ...styles.chatPane,
                  border: \`1px solid \${chatFocused ? T.green : T.border}\`,
                }}
                onClick={() => setFocusedPane('chat')}>
                <span
                  style={{
                    ...styles.paneTitle,
                    color: chatFocused ? T.green : T.dim,
                    maxWidth: isCompact ? '48%' : 'calc(100% - 340px)',
                  }}>
                  {\` \${activeSession.title} │ \${meta.model} \`}
                </span>
                <span style={styles.paneTitleRight}>
                  {!isCompact && (
                    <span>
                      <span style={{color: T.green}}>●</span>{' '}
                      <span style={{color: T.dim}}>{meta.nodes}</span>
                    </span>
                  )}
                  <ContextMeter pct={meta.contextPct} />
                </span>

                <div style={styles.transcript}>
                  {transcript.map(renderTranscriptItem)}
                  {sent.map((text, index) => (
                    <div key={\`sent-\${index}\`} style={styles.userBubble}>
                      <div style={{whiteSpace: 'pre-wrap'}}>{text}</div>
                      <div
                        style={{color: T.dim, textAlign: 'right', fontSize: 11}}>
                        14:35
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.inputArea}>
                  <div style={styles.inputBox}>
                    <span style={{color: T.cyan}}>❯</span>
                    <input
                      style={styles.inputField}
                      aria-label={\`Message \${activeSession.title}\`}
                      placeholder="Type a message...  ( / for commands, @ for files )"
                      value={draft}
                      onChange={event => setDraft(event.target.value)}
                      onFocus={() => setFocusedPane('chat')}
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          sendDraft();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Status bar ===== */}
            <div style={styles.statusBar}>
              {(isCompact ? STATUS_KEYS.slice(0, 3) : STATUS_KEYS).map(
                ([key, label]) => (
                  <span key={key}>
                    <span style={{color: T.yellow}}>{key}</span>{' '}
                    <span style={{color: T.dim}}>{label}</span>
                  </span>
                ),
              )}
              <span style={{flex: 1}} />
              <span style={{color: T.yellow}}>↑ {PRODUCT_VERSION} (ctrl+u)</span>
            </div>
          </div>

          {/* Caption row in token chrome so the surface reads in light demo. */}
          <HStack gap={2} hAlign="center">
            <Text type="supporting" color="secondary">
              Terminal Agent Console — Relay CLI, a full-window TUI for
              running coding-agent sessions
            </Text>
          </HStack>
        </VStack>
      </div>
    </div>
  );
}
`;export{e as default};