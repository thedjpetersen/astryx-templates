var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a dimmed background chat transcript
 *   for the "Relay" terminal agent, a 4-section / 16-row help keymap, a
 *   9-row actions palette, and a 13-row settings dialog with three
 *   sandbox maintenance actions)
 * @output Terminal overlay-dialog specimen page: a dark monospace TUI
 *   stage shows a dimmed agent chat (pane title, user bubble, one tool
 *   box, status bar, input box) behind ONE of three centered rounded
 *   overlay dialogs — Help (cyan-titled 54ch box, yellow section headers,
 *   cyan 20ch key column), Actions (40ch palette with white-on-blue
 *   selection, letter-key + arrow-key + click selection), and Settings
 *   (52ch dialog with right-aligned values, a maintenance section, and a
 *   red "Wipe all files, memories, and context? y/n" confirm on Reset
 *   Sandbox). A SegmentedControl in normal page chrome switches the
 *   visible dialog; every dialog is keyboard-navigable once the stage is
 *   focused.
 * @position Page template; emitted by \`astryx template tui-command-overlays\`
 *
 * Frame: Layout height="fill". LayoutHeader carries token-based chrome
 * (title, caption, and the Help / Actions / Settings SegmentedControl).
 * LayoutContent hosts a var(--color-background-muted) backdrop that
 * centers the fixed dark terminal stage with a caption row underneath
 * naming the surface, so the template still reads in light demo chrome.
 *
 * Responsive contract:
 * - The stage is a fixed dark surface: maxWidth 880, height 560,
 *   shrinking fluidly to the container width; the backdrop scrolls.
 * - Overlay dialogs are sized in ch units (54ch / 40ch / 52ch — the
 *   spec's column widths on the monospace root) and cap at
 *   calc(100% - 32px) so they never clip on narrow stages.
 * - Header chrome wraps: below ~640px the SegmentedControl drops under
 *   the title (flexWrap on the header row). No useElementWidth needed —
 *   the page is a single centered column at every width.
 *
 * Color policy: the terminal stage is a scheme-locked dark surface
 * (colorScheme: 'dark', fixed batch-2 terminal palette as raw literals —
 * real TUIs are dark in both themes; do NOT tokenize these). Everything
 * outside the stage (header, captions, SegmentedControl) uses Astryx
 * tokens and follows the active color scheme.
 *
 * Keyboard contract (stage focused, tabIndex 0):
 * - Help: ArrowUp/ArrowDown or j/k move the row highlight.
 * - Actions: arrows move, ↵ runs the highlighted action, a row's own
 *   letter key (n w S R e a p F ?) selects AND runs it, Esc clears the
 *   "ran" footer line. Clicking a row selects and runs it.
 * - Settings: arrows move, ↵ activates (value rows explain themselves;
 *   Refresh/Backup post a green ✓ line; Reset Sandbox asks the red y/n
 *   confirm — y wipes, n or Esc cancels).
 */

import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
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
import {Kbd} from '@astryxdesign/core/Kbd';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

// ============= TERMINAL PALETTE =============
// Scheme-locked TUI surface: fixed dark palette (batch-2 terminal spec).
// Raw literals are intentional — the stage stays dark in both themes and
// must never be converted to theme tokens.

const T = {
  bg: '#0d1117',
  panel: '#161b22',
  border: '#30363d',
  borderBright: '#3d444d',
  text: '#e6edf3',
  dim: '#8b949e',
  green: '#3fb950',
  yellow: '#d29922',
  red: '#f85149',
  cyan: '#39c5cf',
  blue: '#58a6ff',
  selectionBg: '#1f6feb',
} as const;

const MONO_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // Token-based backdrop behind the fixed dark stage.
  backdrop: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
  },
  backdropInner: {
    maxWidth: 960,
    marginInline: 'auto',
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  captionRow: {flexWrap: 'wrap'},
  // The terminal stage: fixed dark surface, monospace root.
  stage: {
    position: 'relative',
    width: '100%',
    maxWidth: 880,
    height: 560,
    marginInline: 'auto',
    backgroundColor: T.bg,
    border: \`1px solid \${T.border}\`,
    borderRadius: 12,
    overflow: 'hidden',
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    lineHeight: 1.6,
    color: T.text,
    colorScheme: 'dark',
    cursor: 'default',
  },
  // ----- dimmed background transcript -----
  bgChrome: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 16,
    opacity: 0.5,
  },
  chatPane: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    border: \`1px solid \${T.border}\`,
    borderRadius: 8,
    padding: '16px 14px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflow: 'hidden',
  },
  paneTitle: {
    position: 'absolute',
    top: -11,
    left: 12,
    backgroundColor: T.bg,
    paddingInline: 4,
    color: T.dim,
    whiteSpace: 'pre',
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '70%',
    border: \`1px solid \${T.border}\`,
    borderRadius: 6,
    padding: '3px 10px',
  },
  toolBox: {
    border: \`1px solid \${T.border}\`,
    borderRadius: 6,
    overflow: 'hidden',
    maxWidth: 560,
  },
  toolBoxHeader: {
    display: 'flex',
    gap: 8,
    alignItems: 'baseline',
    padding: '3px 10px',
    borderBottom: \`1px solid \${T.border}\`,
    backgroundColor: T.panel,
  },
  toolBoxBody: {padding: '4px 10px', whiteSpace: 'pre'},
  inputBox: {
    border: \`1px solid \${T.border}\`,
    borderRadius: 8,
    padding: '7px 12px',
    color: T.dim,
    whiteSpace: 'pre',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statusBar: {
    display: 'flex',
    gap: 14,
    alignItems: 'baseline',
    paddingInline: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  scrim: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(1, 4, 9, 0.55)',
  },
  // ----- overlay dialogs -----
  // Wrapper stays overflow-visible so the on-border title span is never
  // clipped; the inner dialogBody owns scrolling when content is tall.
  dialog: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 'calc(100% - 32px)',
    maxHeight: 'calc(100% - 48px)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: T.panel,
    border: \`1px solid \${T.borderBright}\`,
    borderRadius: 8,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
  },
  dialogBody: {
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    paddingBlock: '14px 10px',
  },
  dialogTitle: {
    position: 'absolute',
    top: -10,
    left: 14,
    backgroundColor: T.panel,
    color: T.cyan,
    fontWeight: 600,
    whiteSpace: 'pre',
  },
  sectionHeader: {
    color: T.yellow,
    padding: '8px 16px 1px',
  },
  helpRow: {
    display: 'flex',
    padding: '1px 16px',
  },
  helpKeyCell: {
    width: '20ch',
    flexShrink: 0,
    color: T.cyan,
    whiteSpace: 'pre',
  },
  optionRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'baseline',
    padding: '2px 16px',
    cursor: 'pointer',
  },
  hintRow: {
    marginTop: 8,
    padding: '5px 16px 0',
    borderTop: \`1px solid \${T.border}\`,
    color: T.dim,
    whiteSpace: 'pre-wrap',
  },
  settingsValue: {
    marginLeft: 'auto',
    color: T.dim,
    whiteSpace: 'pre',
  },
  separator: {
    borderTop: \`1px solid \${T.border}\`,
    marginBlock: 6,
  },
  confirmLine: {
    marginTop: 8,
    padding: '6px 16px 0',
    borderTop: \`1px solid \${T.border}\`,
    color: T.red,
    whiteSpace: 'pre-wrap',
  },
};

// ============= DATA =============
// Deterministic fixtures only — fixed strings, no clocks, no randomness.

const SURFACE_NAME = 'Relay terminal';
const SESSION_TITLE = ' fix flaky deploy checks │ Relay Ultra ';

type OverlayId = 'help' | 'actions' | 'settings';

// --- background transcript (dimmed; purely decorative) ---

const BG_ASSISTANT_LINES = [
  'Pulled the last 5 runs — the failure is a race in the',
  'deploy smoke test, not the pipeline itself. Reproducing',
  'it locally before I patch the retry window.',
];

const BG_TOOL_OUTPUT = [
  {text: '✓ completed', color: T.green},
  {text: '$ pnpm test --filter deploy', color: T.cyan},
  {text: 'RUN  deploy/smoke.spec.ts', color: T.dim},
  {text: 'FAIL retry window closed after 2 attempts', color: T.dim},
  {text: '  ... (14 more lines)', color: T.dim},
];

const BG_STATUS_KEYS: ReadonlyArray<{key: string; label: string}> = [
  {key: '↵', label: 'send'},
  {key: 'Esc', label: 'scroll'},
  {key: 'ctrl+o', label: 'actions'},
  {key: 'Tab', label: 'messages'},
  {key: '?', label: 'help'},
];

// --- HELP dialog: 4 yellow section headers, 16 key rows ---

interface HelpSection {
  title: string;
  rows: ReadonlyArray<{keys: string; desc: string}>;
}

const HELP_SECTIONS: readonly HelpSection[] = [
  {
    title: 'Navigation',
    rows: [
      {keys: '↑/↓ or j/k', desc: 'Move between sessions'},
      {keys: 'Tab', desc: 'Cycle message panes'},
      {keys: '1-4', desc: 'Jump to kanban lane'},
    ],
  },
  {
    title: 'Chat',
    rows: [
      {keys: '↵', desc: 'Send message'},
      {keys: 'Esc', desc: 'Enter scroll mode'},
      {keys: 'ctrl+x', desc: 'Stop the running agent'},
      {keys: '/', desc: 'Slash commands'},
      {keys: '@', desc: 'Attach a file'},
    ],
  },
  {
    title: 'Session Management',
    rows: [
      {keys: 'n', desc: 'New session'},
      {keys: 'K', desc: 'Fork conversation'},
      {keys: 'p', desc: 'Pin / unpin session'},
      {keys: 'a', desc: 'Archive session'},
      {keys: 'Z', desc: 'Schedules'},
    ],
  },
  {
    title: 'Tools & Settings',
    rows: [
      {keys: 'm', desc: 'Change model / yap level'},
      {keys: 'ctrl+o', desc: 'Actions palette'},
      {keys: 'ctrl+u', desc: 'Update to v1.2.4'},
    ],
  },
];

// Flattened highlight indices, precomputed once at module level so render
// never mutates a cursor: each key row knows its position in the single
// arrow-key sequence that spans all four sections.
const HELP_SECTIONS_INDEXED = (() => {
  let flatIndex = 0;
  return HELP_SECTIONS.map(section => ({
    title: section.title,
    rows: section.rows.map(row => ({...row, flatIndex: flatIndex++})),
  }));
})();

const HELP_ROW_COUNT = HELP_SECTIONS.reduce(
  (total, section) => total + section.rows.length,
  0,
);

// --- ACTIONS palette: letter key + label rows ---

const ACTIONS: ReadonlyArray<{key: string; label: string}> = [
  {key: 'n', label: 'New session'},
  {key: 'w', label: 'Switch workspace'},
  {key: 'S', label: 'Share link'},
  {key: 'R', label: 'Rename'},
  {key: 'e', label: 'Export as Markdown'},
  {key: 'a', label: 'Archive'},
  {key: 'p', label: 'Pin / unpin'},
  {key: 'F', label: 'Browse files'},
  {key: '?', label: 'About'},
];

// --- SETTINGS dialog: 10 value rows + separator + 3 maintenance rows ---

interface SettingsRow {
  id: string;
  label: string;
  value?: string;
  valueColor?: string;
  hasNodeDot?: boolean;
  kind: 'value' | 'maintenance';
  isDanger?: boolean;
}

const SETTINGS_ROWS: readonly SettingsRow[] = [
  {id: 'env', label: 'Environment Variables', value: '3 set', kind: 'value'},
  {
    id: 'repos',
    label: 'Connected Repos',
    value: '2 connected',
    kind: 'value',
  },
  {
    id: 'nodes',
    label: 'Active Nodes',
    value: 'cli:laptop',
    hasNodeDot: true,
    kind: 'value',
  },
  {id: 'model', label: 'Default Model', value: 'relay-ultra', kind: 'value'},
  {id: 'yap', label: 'Yap Level', value: 'concise', kind: 'value'},
  {
    id: 'bell',
    label: 'Bell on Done',
    value: 'on',
    valueColor: T.green,
    kind: 'value',
  },
  {id: 'sound', label: 'Notification Sound', value: 'chime', kind: 'value'},
  {id: 'scroll', label: 'Scroll Step', value: '5 lines', kind: 'value'},
  {id: 'kanban', label: 'Kanban Refresh', value: '30s', kind: 'value'},
  {id: 'compact', label: 'Auto-compact', value: 'at 85%', kind: 'value'},
  {id: 'refresh', label: 'Refresh Sandbox', kind: 'maintenance'},
  {
    id: 'reset',
    label: 'Reset Sandbox',
    kind: 'maintenance',
    isDanger: true,
  },
  {id: 'backup', label: 'Create Backup', kind: 'maintenance'},
];

// Index of the first maintenance row — the separator renders above it.
const MAINTENANCE_START = SETTINGS_ROWS.findIndex(
  row => row.kind === 'maintenance',
);

interface SettingsNote {
  tone: 'success' | 'dim';
  text: string;
}

const SETTINGS_NOTES: Record<string, SettingsNote> = {
  refresh: {tone: 'success', text: '✓ Sandbox refreshed — 12 skills reloaded'},
  backup: {
    tone: 'success',
    text: '✓ Backup created — relay-backup-2026-07-12.tar.gz',
  },
  value: {tone: 'dim', text: '↵ opens the editor for this setting in the full app'},
};

// ============= PAGE =============

export default function TuiCommandOverlaysTemplate() {
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [overlay, setOverlay] = useState<OverlayId>('help');
  // Help: highlighted key row (flattened across sections).
  const [helpIndex, setHelpIndex] = useState(0);
  // Actions: highlighted row + the last action that "ran".
  const [actionIndex, setActionIndex] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  // Settings: highlighted row, transient note, and the reset confirm.
  const [settingsIndex, setSettingsIndex] = useState(0);
  const [settingsNote, setSettingsNote] = useState<SettingsNote | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const switchOverlay = (value: string) => {
    setOverlay(value as OverlayId);
    // Transient dialog state never survives a specimen switch.
    setLastAction(null);
    setSettingsNote(null);
    setIsConfirmingReset(false);
    stageRef.current?.focus();
  };

  const runAction = (index: number) => {
    setActionIndex(index);
    setLastAction(ACTIONS[index].label);
  };

  const activateSettingsRow = (index: number) => {
    const row = SETTINGS_ROWS[index];
    setSettingsIndex(index);
    if (row.id === 'reset') {
      setSettingsNote(null);
      setIsConfirmingReset(true);
      return;
    }
    setIsConfirmingReset(false);
    setSettingsNote(
      row.kind === 'maintenance' ? SETTINGS_NOTES[row.id] : SETTINGS_NOTES.value,
    );
  };

  const handleStageKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const {key} = event;
    const isDown = key === 'ArrowDown' || key === 'j';
    const isUp = key === 'ArrowUp' || key === 'k';

    if (overlay === 'help') {
      if (isDown) {
        setHelpIndex(prev => Math.min(prev + 1, HELP_ROW_COUNT - 1));
      } else if (isUp) {
        setHelpIndex(prev => Math.max(prev - 1, 0));
      } else {
        return;
      }
      event.preventDefault();
      return;
    }

    if (overlay === 'actions') {
      if (isDown) {
        setActionIndex(prev => Math.min(prev + 1, ACTIONS.length - 1));
      } else if (isUp) {
        setActionIndex(prev => Math.max(prev - 1, 0));
      } else if (key === 'Enter') {
        runAction(actionIndex);
      } else if (key === 'Escape') {
        setLastAction(null);
      } else {
        const matched = ACTIONS.findIndex(action => action.key === key);
        if (matched === -1) {
          return;
        }
        runAction(matched);
      }
      event.preventDefault();
      return;
    }

    // Settings.
    if (isConfirmingReset) {
      if (key === 'y') {
        setIsConfirmingReset(false);
        setSettingsNote({
          tone: 'success',
          text: '✓ Sandbox reset — files, memories, and context wiped',
        });
      } else if (key === 'n' || key === 'Escape') {
        setIsConfirmingReset(false);
      } else {
        return;
      }
      event.preventDefault();
      return;
    }
    if (isDown) {
      setSettingsIndex(prev => Math.min(prev + 1, SETTINGS_ROWS.length - 1));
    } else if (isUp) {
      setSettingsIndex(prev => Math.max(prev - 1, 0));
    } else if (key === 'Enter') {
      activateSettingsRow(settingsIndex);
    } else if (key === 'Escape') {
      setSettingsNote(null);
    } else {
      return;
    }
    event.preventDefault();
  };

  // ----- dimmed background transcript -----

  const backgroundChat = (
    <div style={styles.bgChrome} aria-hidden>
      <div style={styles.chatPane}>
        <span style={styles.paneTitle}>{SESSION_TITLE}</span>
        <div style={styles.userBubble}>
          the deploy check on PR #482 is flaky again — can you take a look?
        </div>
        {BG_ASSISTANT_LINES.map(line => (
          <div key={line}>{line}</div>
        ))}
        <div style={styles.toolBox}>
          <div style={styles.toolBoxHeader}>
            <span style={{color: T.dim}}>{'▾'}</span>
            <span style={{color: T.yellow}}>bash</span>
            <span style={{color: T.dim}}>pnpm test --filter deploy</span>
            <span style={{marginLeft: 'auto', color: T.green}}>{'✓'}</span>
            <span style={{color: T.dim}}>1.5s</span>
          </div>
          <div style={styles.toolBoxBody}>
            {BG_TOOL_OUTPUT.map(line => (
              <div key={line.text} style={{color: line.color}}>
                {line.text}
              </div>
            ))}
          </div>
        </div>
        <div style={{color: T.dim}}>
          <span style={{color: T.green}}>{'●'}</span>
          {' pondering...(ctrl+x to stop)'}
        </div>
      </div>
      <div style={styles.inputBox}>
        {'Type a message...  ( / for commands, @ for files )'}
      </div>
      <div style={styles.statusBar}>
        {BG_STATUS_KEYS.map(pair => (
          <span key={pair.key}>
            <span style={{color: T.yellow}}>{pair.key}</span>
            <span style={{color: T.dim}}>{\` \${pair.label}\`}</span>
          </span>
        ))}
        <span style={{marginLeft: 'auto', color: T.yellow}}>
          {'↑ v1.2.3 (ctrl+u)'}
        </span>
      </div>
    </div>
  );

  // ----- HELP overlay -----

  const helpDialog = (
    <div
      role="dialog"
      aria-label="Help — keyboard shortcuts"
      style={{...styles.dialog, width: '54ch'}}>
      <span style={styles.dialogTitle}>{' Help '}</span>
      <div style={styles.dialogBody}>
        {HELP_SECTIONS_INDEXED.map(section => (
          <div key={section.title}>
            <div style={styles.sectionHeader}>{section.title}</div>
            {section.rows.map(row => (
              <div
                key={row.keys}
                style={{
                  ...styles.helpRow,
                  backgroundColor:
                    row.flatIndex === helpIndex
                      ? 'rgba(88, 166, 255, 0.14)'
                      : undefined,
                }}>
                <span style={styles.helpKeyCell}>{row.keys}</span>
                <span style={{color: T.text}}>{row.desc}</span>
              </div>
            ))}
          </div>
        ))}
        <div style={styles.hintRow}>
          <span style={{color: T.yellow}}>{'↑↓'}</span>
          {' move   '}
          <span style={{color: T.yellow}}>esc</span>
          {' close'}
        </div>
      </div>
    </div>
  );

  // ----- ACTIONS overlay -----

  const actionsDialog = (
    <div
      role="dialog"
      aria-label="Actions palette"
      style={{...styles.dialog, width: '40ch'}}>
      <span style={styles.dialogTitle}>{' Actions '}</span>
      <div style={styles.dialogBody}>
        <div role="listbox" aria-label="Actions">
          {ACTIONS.map((action, index) => {
            const isSelected = index === actionIndex;
            return (
              <div
                key={action.key}
                role="option"
                aria-selected={isSelected}
                style={{
                  ...styles.optionRow,
                  backgroundColor: isSelected ? T.selectionBg : undefined,
                  color: isSelected ? '#ffffff' : T.text,
                }}
                onClick={() => runAction(index)}>
                <span
                  style={{
                    width: '2ch',
                    flexShrink: 0,
                    color: isSelected ? '#ffffff' : T.cyan,
                  }}>
                  {action.key}
                </span>
                <span>{action.label}</span>
              </div>
            );
          })}
        </div>
        <div style={styles.hintRow}>
          <span style={{color: T.yellow}}>{'key/↵'}</span>
          {' select   '}
          <span style={{color: T.yellow}}>esc</span>
          {' close'}
          {lastAction != null && (
            <div style={{color: T.green}}>{\`✓ ran: \${lastAction}\`}</div>
          )}
        </div>
      </div>
    </div>
  );

  // ----- SETTINGS overlay -----

  const settingsDialog = (
    <div
      role="dialog"
      aria-label="Settings"
      style={{...styles.dialog, width: '52ch'}}>
      <span style={styles.dialogTitle}>{' Settings '}</span>
      <div style={styles.dialogBody}>
        <div role="listbox" aria-label="Settings rows">
          {SETTINGS_ROWS.map((row, index) => {
            const isSelected = index === settingsIndex;
            return (
              <div key={row.id}>
                {index === MAINTENANCE_START && (
                  <div style={styles.separator} />
                )}
                <div
                  role="option"
                  aria-selected={isSelected}
                  style={{
                    ...styles.optionRow,
                    backgroundColor: isSelected
                      ? row.isDanger
                        ? 'rgba(248, 81, 73, 0.16)'
                        : 'rgba(88, 166, 255, 0.14)'
                      : undefined,
                  }}
                  onClick={() => activateSettingsRow(index)}>
                  <span
                    style={{
                      width: '2ch',
                      flexShrink: 0,
                      color: row.isDanger ? T.red : T.cyan,
                      whiteSpace: 'pre',
                    }}>
                    {isSelected ? '❯' : ' '}
                  </span>
                  <span style={{color: row.isDanger ? T.red : T.text}}>
                    {row.label}
                  </span>
                  {row.value != null && (
                    <span
                      style={{
                        ...styles.settingsValue,
                        color: row.valueColor ?? T.dim,
                      }}>
                      {row.value}
                      {row.hasNodeDot === true && (
                        <span style={{color: T.green}}>{' ●'}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {isConfirmingReset ? (
          <div style={styles.confirmLine}>
            {'Wipe all files, memories, and context?  '}
            <span style={{color: T.yellow}}>y</span>
            <span style={{color: T.dim}}>/</span>
            <span style={{color: T.yellow}}>n</span>
          </div>
        ) : settingsNote != null ? (
          <div
            style={{
              ...styles.hintRow,
              color: settingsNote.tone === 'success' ? T.green : T.dim,
            }}>
            {settingsNote.text}
          </div>
        ) : (
          <div style={styles.hintRow}>
            <span style={{color: T.yellow}}>{'↑↓'}</span>
            {' move   '}
            <span style={{color: T.yellow}}>{'↵'}</span>
            {' select   '}
            <span style={{color: T.yellow}}>esc</span>
            {' close'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" style={styles.headerRow}>
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Terminal overlay dialogs</Heading>
                <Text type="supporting" color="secondary">
                  Help, actions, and settings specimens over a dimmed Relay
                  session
                </Text>
              </VStack>
            </StackItem>
            <SegmentedControl
              label="Overlay specimen"
              size="sm"
              value={overlay}
              onChange={switchOverlay}>
              <SegmentedControlItem value="help" label="Help" />
              <SegmentedControlItem value="actions" label="Actions" />
              <SegmentedControlItem value="settings" label="Settings" />
            </SegmentedControl>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.backdrop}>
            <div style={styles.backdropInner}>
              <VStack gap={3}>
                <div
                  ref={stageRef}
                  tabIndex={0}
                  aria-label={\`\${SURFACE_NAME} overlay demo stage\`}
                  style={styles.stage}
                  onKeyDown={handleStageKeyDown}
                  onMouseDown={() => stageRef.current?.focus()}>
                  {backgroundChat}
                  <div style={styles.scrim} aria-hidden />
                  {overlay === 'help' && helpDialog}
                  {overlay === 'actions' && actionsDialog}
                  {overlay === 'settings' && settingsDialog}
                </div>
                <HStack gap={2} vAlign="center" style={styles.captionRow}>
                  <Text type="supporting" color="secondary">
                    {SURFACE_NAME} — overlay dialogs. Click the stage, then
                    use {'↑ ↓'},
                  </Text>
                  <Kbd keys="enter" />
                  <Text type="supporting" color="secondary">
                    and
                  </Text>
                  <Kbd keys="escape" />
                  <Text type="supporting" color="secondary">
                    (or a row&apos;s own letter key) to drive the dialog.
                  </Text>
                </HStack>
              </VStack>
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};