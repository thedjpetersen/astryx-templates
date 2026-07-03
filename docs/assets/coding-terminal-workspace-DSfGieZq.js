var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (three terminal sessions for
 *   mira@orbit-dev in ~/code/orbit-console: a zsh scrollback with git
 *   status output, a frozen npm-install progress block, and a red
 *   missing-file stderr; a vite dev-server log with fixture HMR
 *   timestamps; a vitest run with one failing assertion and exit 1 —
 *   plus a fixed command list for the palette; no clocks, randomness,
 *   or network assets)
 * @output Multi-tab terminal workspace: a 250px session sidebar with
 *   running/idle StatusDots and new-output activity dots, a scrollable
 *   tab strip of sessions, dark monospace scrollback rendered from typed
 *   line records (green user@host + blue cwd prompt lines, plain stdout,
 *   red stderr, ✓/✗ exit-code markers, npm-install progress bars), a
 *   search-in-scrollback bar with match highlights and prev/next
 *   navigation, a split-pane toggle that shows two sessions side by
 *   side, a mod+K command palette (filterable sessions + workspace
 *   actions that really run), a prompt-caret input row per pane, and a
 *   status-bar footer (pid, geometry, encoding, session tally)
 * @position Page template; emitted by \`astryx template coding-terminal-workspace\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the product title,
 * the split-view ToggleButton, and the palette trigger (narrow swaps in
 * a sessions IconButton). LayoutPanel start (250px, padding 0) is the
 * session sidebar. LayoutContent is the terminal column — tab strip,
 * optional search bar, scrollback pane(s), input row. LayoutFooter is
 * the status bar. All chrome is fixed; only scrollback scrolls.
 *
 * Responsive contract:
 * - >640px: sidebar fixed at 250px (LayoutPanel start); the terminal
 *   column fills the rest. The split toggle lives in the header; split
 *   mode renders two equal panes with a shared tab strip and per-pane
 *   headers (the right pane picks its session from a chip row).
 * - <=640px: the sidebar leaves the flow and a header PanelLeft toggle
 *   reveals the same session list as a bordered block above the tab
 *   strip; picking a session closes it. The split control is hidden per
 *   contract (split-pane mode is unavailable) and any active split
 *   renders as the single active pane. The palette stays 640px wide,
 *   capped at 100vw minus a spacing-4 gutter. The status bar drops the
 *   pid/geometry/encoding cells; session tally stays.
 * - Tap targets: session tabs and sidebar rows are >=44px tall; search
 *   prev/next/close, the tab-strip search toggle, and header buttons sit
 *   in >=40px rows. Nothing is hover-only — activity dots, status dots,
 *   and the search toggle are always visible.
 * - Scrollback lines never wrap (white-space: pre); the scroller pans
 *   horizontally on purpose so long rg/vite paths stay on one line.
 *   Everything is usable at 375px.
 *
 * Container policy (terminal-workspace archetype): dense tool chrome —
 * no Cards in the frame. Sidebar, tab strip, search bar, scrollback,
 * and status bar are bordered rows/panels; the scrollback keeps its own
 * fixed dark palette (never themed Text colors) so it stays dark in
 * both themes. The only Card is the floating command palette.
 *
 * Color policy: the scrollback panes are deliberately scheme-locked
 * terminal-dark surfaces — the TERM literals (backgrounds, borders,
 * ANSI-ish text colors, progress bars, amber search highlights, caret,
 * input row) stay raw hex/rgba and styles.terminalPane pins
 * colorScheme: 'dark' so the panes render identically in light and
 * dark themes; text on those panes uses the same literals so it stays
 * readable. Everything outside the panes (sidebar, tab strip, search
 * bar, status bar, palette) uses Astryx tokens, and the new-output
 * activity dot on themed chrome is an explicit light-dark() pair.
 *
 * Interaction contract:
 * - Tabs and sidebar rows switch the active session and clear its
 *   new-output activity dot; switching to the session shown in the
 *   split pane swaps the two panes instead of duplicating.
 * - The header ToggleButton opens/closes split view; the right pane's
 *   chip row re-targets it to any other session.
 * - The tab-strip search toggle opens the scrollback search bar (seeded
 *   open with "git" and the second match active); typing recounts
 *   matches live, prev/next cycle with wraparound, the active match
 *   gets the solid highlight, and matches only apply to the primary
 *   pane. Escape in the field closes it.
 * - mod+K (or the header button) opens the command palette; typing
 *   filters sessions and actions with match highlighting; ArrowUp/Down
 *   move the keyboard highlight (wrapping), Enter runs, Escape or a
 *   scrim click closes. Actions really run: switch session, toggle
 *   split, open search, new session, mark all seen.
 * - "New session" (sidebar + palette) appends a fresh zsh session from
 *   a fixture blueprint and activates it.
 * - Every mutation is announced via a visually-hidden aria-live region.
 *
 * Fixture policy: fixed strings only — vite timestamps and the login
 * banner are frozen, progress percentages are hand-authored, pids are
 * fake, and nothing resembles a credential.
 */

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {
  CommandPaletteEmpty,
  CommandPaletteFooter,
  CommandPaletteGroup,
  CommandPaletteInput,
  CommandPaletteItem,
  CommandPaletteList,
} from '@astryxdesign/core/CommandPalette';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Overlay} from '@astryxdesign/core/Overlay';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  CheckCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Columns2Icon,
  CommandIcon,
  FlaskConicalIcon,
  PanelLeftIcon,
  PlusIcon,
  SearchIcon,
  ServerIcon,
  TerminalIcon,
  XIcon,
} from 'lucide-react';

// ============= TERMINAL PALETTE =============
// The scrollback reproduces a real terminal, so it keeps its own fixed
// dark palette instead of themed Text colors (it must stay dark in both
// themes). Same GitHub-dark-adjacent ramp as cli-pairing-console.
// Scheme-locked on purpose: these literals never adapt to the theme —
// styles.terminalPane sets colorScheme: 'dark' so the panes (and any
// UA-rendered scrollbars inside them) stay dark under both schemes.

const TERM = {
  bg: '#0d1117',
  bgRaised: '#161b22',
  border: '#22272e',
  base: '#c9d1d9',
  dim: '#768390',
  cyan: '#39c5cf',
  green: '#3fb950',
  red: '#f47067',
  yellow: '#d4a72c',
  blue: '#539bf5',
} as const;

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {
    height: '100dvh',
    width: '100%',
  },
  overlay: {
    display: 'block',
    height: '100%',
    width: '100%',
  },

  // ---- Sidebar ----
  pane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  paneHeader: {
    alignItems: 'center',
    padding: '0 var(--spacing-2) 0 var(--spacing-3)',
    minHeight: 44,
    boxSizing: 'border-box',
  },
  paneScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  paneFootnote: {
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  // Session rows are real buttons: >=44px tall, selected row carries an
  // inset accent bar so state never depends on hover.
  sessionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    border: 'none',
    background: 'transparent',
    padding: '0 var(--spacing-3)',
    margin: 0,
    cursor: 'pointer',
    font: 'inherit',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  sessionRowActive: {
    backgroundColor: 'var(--color-accent-muted)',
    boxShadow: 'inset 2px 0 0 0 var(--color-accent)',
  },
  // Narrow-only drawer: same rows, rendered as a block above the tabs.
  sessionDrawer: {
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    flexShrink: 0,
  },

  // ---- Terminal column ----
  terminalColumn: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  // Tabs keep intrinsic width; the strip scrolls instead of crushing
  // labels. The search toggle sits outside the scroller so it never
  // scrolls away.
  tabRow: {
    display: 'flex',
    alignItems: 'stretch',
    flexShrink: 0,
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  tabScroller: {
    display: 'flex',
    overflowX: 'auto',
    flex: 1,
    minWidth: 0,
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 44,
    padding: '0 var(--spacing-3)',
    border: 'none',
    borderRight: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    margin: 0,
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  tabActive: {
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
    boxShadow: 'inset 0 2px 0 0 var(--color-accent)',
  },
  tabTools: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 var(--spacing-2)',
    borderLeft: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  // Always-visible new-output dot (amber) on tabs and sidebar rows.
  // These sit on themed chrome (not the locked terminal panes), so the
  // amber is a light-dark pair: TERM.yellow in light, brighter in dark.
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'light-dark(#d4a72c, #e3b341)',
    flexShrink: 0,
  },

  // ---- Search bar ----
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 44,
    padding: '0 var(--spacing-2) 0 var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxSizing: 'border-box',
    flexShrink: 0,
  },

  // ---- Scrollback ----
  paneStack: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
  },
  splitGrid: {
    flex: 1,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  splitDividerPane: {
    borderLeft: 'var(--border-width) solid var(--color-border)',
  },
  terminalPane: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
    backgroundColor: TERM.bg,
    // Scheme-locked surface: the terminal stays dark in both themes
    // (see the TERM palette note and the header Color policy).
    colorScheme: 'dark',
  },
  terminalPaneHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 40,
    padding: '0 var(--spacing-2) 0 var(--spacing-3)',
    backgroundColor: TERM.bgRaised,
    borderBottom: \`1px solid \${TERM.border}\`,
    boxSizing: 'border-box',
    flexShrink: 0,
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: TERM.dim,
    overflowX: 'auto',
    whiteSpace: 'nowrap',
  },
  // Chip that re-targets the split pane; >=36px, terminal-toned.
  paneChip: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 36,
    padding: '0 var(--spacing-2)',
    border: \`1px solid \${TERM.border}\`,
    borderRadius: 'var(--radius-control)',
    background: 'transparent',
    margin: 0,
    cursor: 'pointer',
    font: 'inherit',
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: TERM.base,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  paneChipActive: {
    borderColor: TERM.blue,
    color: TERM.blue,
  },
  // Lines never wrap: white-space pre + max-content width, so the
  // scroller pans horizontally instead of folding long paths.
  scroller: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    padding: 'var(--spacing-3) 0',
  },
  line: {
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    lineHeight: 1.7,
    color: TERM.base,
    whiteSpace: 'pre',
    minWidth: 'max-content',
    padding: '0 var(--spacing-4) 0 var(--spacing-3)',
  },
  progressTrack: {
    display: 'inline-block',
    width: 120,
    height: 8,
    borderRadius: 4,
    backgroundColor: TERM.border,
    overflow: 'hidden',
    verticalAlign: 'middle',
    marginInline: 'var(--spacing-2)',
  },
  progressFill: {
    display: 'block',
    height: '100%',
    backgroundColor: TERM.cyan,
  },
  // Search highlights: translucent amber for every match, solid amber
  // with inverted text for the active one. Literal rgba on purpose —
  // they sit on the scheme-locked terminal surface (TERM.yellow @ 35%).
  searchMatch: {
    backgroundColor: 'rgba(212, 167, 44, 0.35)',
    color: 'inherit',
    borderRadius: 2,
  },
  searchMatchActive: {
    backgroundColor: TERM.yellow,
    color: TERM.bg,
    borderRadius: 2,
  },

  // ---- Input row ----
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 40,
    padding: '0 var(--spacing-4) 0 var(--spacing-3)',
    borderTop: \`1px solid \${TERM.border}\`,
    backgroundColor: TERM.bg,
    boxSizing: 'border-box',
    flexShrink: 0,
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    color: TERM.base,
    whiteSpace: 'pre',
    overflowX: 'auto',
  },
  caret: {
    display: 'inline-block',
    width: 8,
    height: 15,
    backgroundColor: TERM.base,
    verticalAlign: 'text-bottom',
    marginLeft: 2,
    flexShrink: 0,
  },

  // ---- Status bar ----
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1) var(--spacing-3)',
    minHeight: 40,
    padding: '0 var(--spacing-3)',
    boxSizing: 'border-box',
  },
  statusSpacer: {
    flex: 1,
  },

  // ---- Command palette ----
  paletteLayer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    paddingTop: '18vh',
    paddingInline: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  paletteCard: {
    overflow: 'hidden',
  },
  resultList: {
    maxHeight: '48vh',
    overflowY: 'auto',
  },
  matchHighlight: {
    backgroundColor: 'var(--color-accent-muted)',
    color: 'inherit',
  },

  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============
// Scrollback is a flat array of typed line records rendered by one
// switch — deliberately not an ANSI parser or virtual terminal.

const USER = 'mira';
const HOST = 'orbit-dev';
const HOME_CWD = '~/code/orbit-console';

type TermLine =
  | {kind: 'prompt'; text: string; user: string; host: string; cwd: string}
  | {kind: 'stdout'; text: string}
  | {kind: 'stderr'; text: string}
  | {kind: 'exit'; text: string; code: number}
  | {kind: 'progress'; text: string; stage: string; percent: number};

// Shorthand constructors keep the fixture sources readable.
const prompt = (text: string, cwd: string = HOME_CWD): TermLine => ({
  kind: 'prompt',
  text,
  user: USER,
  host: HOST,
  cwd,
});
const out = (text: string): TermLine => ({kind: 'stdout', text});
const err = (text: string): TermLine => ({kind: 'stderr', text});
const exit = (code: number, text: string): TermLine => ({
  kind: 'exit',
  code,
  text,
});
const progress = (
  stage: string,
  percent: number,
  text: string,
): TermLine => ({kind: 'progress', stage, percent, text});

type SessionKind = 'shell' | 'server' | 'tests';
type SessionStatus = 'running' | 'idle';

interface TerminalSession {
  id: string;
  name: string;
  kind: SessionKind;
  status: SessionStatus;
  /** The command that owns the session, e.g. 'pnpm dev'. */
  command: string;
  cwd: string;
  pid: number;
  lines: TermLine[];
}

// zsh scrollback: git status, the npm-install progress block (frozen
// percentages), a red missing-file failure, and a deliberately long rg
// invocation that exercises the horizontal scroller.
const SHELL_LINES: TermLine[] = [
  out('Last login: Tue Jul  2 09:41:07 on ttys012'),
  prompt('git status --short'),
  out(' M src/router/routes.ts'),
  out(' M src/session/refresh.ts'),
  out('?? src/styles/tokens.css'),
  exit(0, 'exit 0 · 0.08s'),
  prompt('npm install'),
  progress('idealTree', 34, 'timing idealTree:node_modules/vite Completed in 212ms'),
  progress('reify', 67, 'http fetch GET 200 https://registry.npmjs.org/rollup 88ms (cache miss)'),
  progress('build', 92, 'timing build:link:node_modules/.bin/vite Completed in 141ms'),
  out(''),
  out('added 212 packages, and audited 213 packages in 9s'),
  out(''),
  out('41 packages are looking for funding'),
  out('  run \`npm fund\` for details'),
  out(''),
  out('found 0 vulnerabilities'),
  exit(0, 'exit 0 · 9.41s'),
  prompt('cat .env.production'),
  err('cat: .env.production: No such file or directory'),
  exit(1, 'exit 1 · 0.01s'),
  prompt('git diff --stat src/session'),
  out(' src/session/refresh.ts | 18 ++++++++++--------'),
  out(' 1 file changed, 10 insertions(+), 8 deletions(-)'),
  exit(0, 'exit 0 · 0.05s'),
  prompt('rg "createSession" --glob \\'!dist\\' --glob \\'!coverage\\' -n src'),
  out('src/session/store.ts:41:export async function createSession(input: CreateSessionInput): Promise<Session> {'),
  out('src/session/store.test.ts:88:    const session = await createSession({tenant: \\'demo\\', role: \\'admin\\'});'),
  out('src/router/routes.ts:126:      const session = await createSession(parseSignupPayload(request));'),
  exit(0, 'exit 0 · 0.12s'),
  prompt('node scripts/seed.mjs --tenant demo'),
  out('seed: connected to local postgres (fixture socket)'),
  out('seed: created 24 fixtures for tenant demo'),
  out('seed: done'),
  exit(0, 'exit 0 · 1.02s'),
];

// vite dev-server log block: frozen banner, URLs, HMR timestamps, one
// red pre-transform error. Still running — no exit record.
const SERVER_LINES: TermLine[] = [
  prompt('pnpm dev'),
  out(''),
  out('> orbit-console@0.4.2 dev ' + HOME_CWD.replace('~', '/Users/mira')),
  out('> vite --host 127.0.0.1'),
  out(''),
  out('  VITE v6.3.1  ready in 412 ms'),
  out(''),
  out('  ➜  Local:   http://127.0.0.1:5173/'),
  out('  ➜  Network: http://192.168.4.21:5173/'),
  out('  ➜  press h + enter to show help'),
  out(''),
  out('09:42:11 [vite] hmr update /src/routes/dashboard.tsx'),
  out('09:42:38 [vite] hmr update /src/components/UsageChart.tsx (x2)'),
  err('09:43:02 [vite] Pre-transform error: Failed to resolve import "./PanelHeader" from "src/components/UsagePanel.tsx". Does the file exist?'),
  out('09:43:05 [vite] page reload src/components/UsagePanel.tsx'),
  out('09:44:19 [vite] hmr update /src/styles/tokens.css'),
];

// vitest run: two passing files, one failing assertion, exit 1. The
// process has exited, so the session reads idle in the sidebar.
const TESTS_LINES: TermLine[] = [
  prompt('pnpm test -- --run'),
  out(''),
  out(' RUN  v3.1.4 /Users/mira/code/orbit-console'),
  out(''),
  out(' ✓ src/lib/format.test.ts (12 tests) 41ms'),
  out(' ✓ src/session/store.test.ts (8 tests) 96ms'),
  err(' ✗ src/router/routes.test.ts > redirects unauthenticated users to /login'),
  err('   AssertionError: expected 302 to be 307 // Object.is equality'),
  err('     at src/router/routes.test.ts:87:31'),
  out(''),
  out(' Test Files  1 failed | 2 passed (3)'),
  out('      Tests  1 failed | 23 passed (24)'),
  out('   Duration  2.31s (transform 312ms, setup 0ms, collect 890ms)'),
  out(''),
  exit(1, 'exit 1 · 2.31s'),
];

// Blueprint for sessions added at runtime via "New session".
const NEW_SESSION_LINES: TermLine[] = [
  out('Welcome to zsh 5.9 (arm64-apple-darwin24.0)'),
  out('Last login: Tue Jul  2 09:41:07 on ttys014'),
];

const INITIAL_SESSIONS: TerminalSession[] = [
  {
    id: 'ses-shell',
    name: 'zsh',
    kind: 'shell',
    status: 'running',
    command: 'zsh',
    cwd: HOME_CWD,
    pid: 48213,
    lines: SHELL_LINES,
  },
  {
    id: 'ses-server',
    name: 'dev server',
    kind: 'server',
    status: 'running',
    command: 'pnpm dev',
    cwd: HOME_CWD,
    pid: 48377,
    lines: SERVER_LINES,
  },
  {
    id: 'ses-tests',
    name: 'tests',
    kind: 'tests',
    status: 'idle',
    command: 'pnpm test -- --run',
    cwd: HOME_CWD,
    pid: 48590,
    lines: TESTS_LINES,
  },
];

const SESSION_ICON: Record<SessionKind, typeof TerminalIcon> = {
  shell: TerminalIcon,
  server: ServerIcon,
  tests: FlaskConicalIcon,
};

const SESSION_STATUS_DOT: Record<
  SessionStatus,
  {variant: 'success' | 'neutral'; label: string; isPulsing: boolean}
> = {
  running: {variant: 'success', label: 'Running', isPulsing: true},
  idle: {variant: 'neutral', label: 'Idle', isPulsing: false},
};

// ============= PALETTE MODEL =============

type PaletteActionId =
  | 'act-new-session'
  | 'act-toggle-split'
  | 'act-find'
  | 'act-mark-seen';

interface PaletteAction {
  id: PaletteActionId;
  label: string;
  hint: string;
  icon: typeof TerminalIcon;
  keys?: string;
  /** Split-pane mode is unavailable <=640px, so its action hides too. */
  isWideOnly?: boolean;
}

const PALETTE_ACTIONS: PaletteAction[] = [
  {
    id: 'act-find',
    label: 'Find in scrollback',
    hint: 'Open the search bar for the active session',
    icon: SearchIcon,
    keys: 'mod+f',
  },
  {
    id: 'act-toggle-split',
    label: 'Toggle split pane',
    hint: 'Show two sessions side by side',
    icon: Columns2Icon,
    keys: 'mod+d',
    isWideOnly: true,
  },
  {
    id: 'act-new-session',
    label: 'New session',
    hint: 'Start a fresh zsh in ' + HOME_CWD,
    icon: PlusIcon,
    keys: 'mod+t',
  },
  {
    id: 'act-mark-seen',
    label: 'Mark all sessions as seen',
    hint: 'Clear every new-output activity dot',
    icon: CheckCheckIcon,
  },
];

interface MatchSegment {
  text: string;
  isMatch: boolean;
}

/** Contiguous case-insensitive match → highlight segments, else null. */
function matchSegments(text: string, term: string): MatchSegment[] | null {
  if (!term) {
    return [{text, isMatch: false}];
  }
  const start = text.toLowerCase().indexOf(term.toLowerCase());
  if (start < 0) {
    return null;
  }
  const segments: MatchSegment[] = [];
  if (start > 0) {
    segments.push({text: text.slice(0, start), isMatch: false});
  }
  segments.push({text: text.slice(start, start + term.length), isMatch: true});
  if (start + term.length < text.length) {
    segments.push({text: text.slice(start + term.length), isMatch: false});
  }
  return segments;
}

function SegmentedLabel({segments}: {segments: MatchSegment[]}) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.isMatch ? (
          <mark key={index} style={styles.matchHighlight}>
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
}

type PaletteEntry =
  | {
      entryKind: 'session';
      id: string;
      session: TerminalSession;
      segments: MatchSegment[];
    }
  | {
      entryKind: 'action';
      id: string;
      action: PaletteAction;
      segments: MatchSegment[];
    };

interface PaletteSection {
  id: string;
  heading: string;
  entries: PaletteEntry[];
}

function buildPaletteSections(
  query: string,
  sessions: TerminalSession[],
  isNarrow: boolean,
): PaletteSection[] {
  const term = query.trim();
  const sections: PaletteSection[] = [];

  const sessionEntries: PaletteEntry[] = [];
  for (const session of sessions) {
    const segments =
      matchSegments(session.name, term) ??
      // Fall back to matching the owning command ('pnpm dev' finds the
      // dev server even though its tab says "dev server").
      (matchSegments(session.command, term)
        ? [{text: session.name, isMatch: false}]
        : null);
    if (segments) {
      sessionEntries.push({
        entryKind: 'session',
        id: \`palette-\${session.id}\`,
        session,
        segments,
      });
    }
  }
  if (sessionEntries.length > 0) {
    sections.push({
      id: 'sessions',
      heading: 'Switch to session',
      entries: sessionEntries,
    });
  }

  const actionEntries: PaletteEntry[] = [];
  for (const action of PALETTE_ACTIONS) {
    if (action.isWideOnly && isNarrow) {
      continue;
    }
    const segments = matchSegments(action.label, term);
    if (segments) {
      actionEntries.push({
        entryKind: 'action',
        id: action.id,
        action,
        segments,
      });
    }
  }
  if (actionEntries.length > 0) {
    sections.push({id: 'actions', heading: 'Actions', entries: actionEntries});
  }

  return sections;
}

// ============= SCROLLBACK SEARCH =============

interface ScrollbackMatch {
  lineIndex: number;
  start: number;
}

/** Non-overlapping case-insensitive occurrences across line texts. */
function findScrollbackMatches(
  lines: TermLine[],
  query: string,
): ScrollbackMatch[] {
  const term = query.trim().toLowerCase();
  if (term.length === 0) {
    return [];
  }
  const matches: ScrollbackMatch[] = [];
  lines.forEach((line, lineIndex) => {
    const haystack = line.text.toLowerCase();
    let from = 0;
    for (;;) {
      const at = haystack.indexOf(term, from);
      if (at < 0) {
        break;
      }
      matches.push({lineIndex, start: at});
      from = at + term.length;
    }
  });
  return matches;
}

/**
 * A line's text with its search matches wrapped in <mark>s. \`matches\`
 * carries global match indices so the active match (solid amber) can be
 * told apart from the rest (translucent amber).
 */
function HighlightedLineText({
  text,
  termLength,
  matches,
  activeMatchIndex,
}: {
  text: string;
  termLength: number;
  matches: {start: number; globalIndex: number}[];
  activeMatchIndex: number;
}) {
  if (matches.length === 0 || termLength === 0) {
    return <>{text}</>;
  }
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start > cursor) {
      nodes.push(
        <span key={\`gap-\${cursor}\`}>{text.slice(cursor, match.start)}</span>,
      );
    }
    nodes.push(
      <mark
        key={\`match-\${match.start}\`}
        style={
          match.globalIndex === activeMatchIndex
            ? styles.searchMatchActive
            : styles.searchMatch
        }>
        {text.slice(match.start, match.start + termLength)}
      </mark>,
    );
    cursor = match.start + termLength;
  }
  if (cursor < text.length) {
    nodes.push(<span key={\`tail-\${cursor}\`}>{text.slice(cursor)}</span>);
  }
  return <>{nodes}</>;
}

// ============= LINE RENDERER =============
// One switch over the record kind — the whole "terminal emulation".

function TermLineRow({
  line,
  lineIndex,
  termLength,
  matches,
  activeMatchIndex,
}: {
  line: TermLine;
  lineIndex: number;
  termLength: number;
  matches: ScrollbackMatch[];
  activeMatchIndex: number;
}) {
  const lineMatches = matches
    .map((match, globalIndex) => ({...match, globalIndex}))
    .filter(match => match.lineIndex === lineIndex);

  const highlighted = (
    <HighlightedLineText
      text={line.text}
      termLength={termLength}
      matches={lineMatches}
      activeMatchIndex={activeMatchIndex}
    />
  );

  switch (line.kind) {
    case 'prompt':
      return (
        <div style={styles.line}>
          <span style={{color: TERM.green}}>
            {line.user}@{line.host}
          </span>
          <span style={{color: TERM.blue}}> {line.cwd}</span>
          <span style={{color: TERM.dim}}> ❯ </span>
          <span>{highlighted}</span>
        </div>
      );
    case 'stdout':
      // Blank stdout records keep the row height (pre + nbsp).
      return (
        <div style={styles.line}>
          {line.text.length === 0 ? '\xA0' : highlighted}
        </div>
      );
    case 'stderr':
      return (
        <div style={{...styles.line, color: TERM.red}}>{highlighted}</div>
      );
    case 'exit':
      return (
        <div
          style={{
            ...styles.line,
            color: line.code === 0 ? TERM.green : TERM.red,
          }}>
          {line.code === 0 ? '✓ ' : '✗ '}
          {highlighted}
        </div>
      );
    case 'progress':
      return (
        <div style={styles.line}>
          <span style={{color: TERM.cyan}}>⠧ {line.stage}</span>
          <span style={styles.progressTrack} aria-hidden="true">
            <span
              style={{...styles.progressFill, width: \`\${line.percent}%\`}}
            />
          </span>
          <span style={{color: TERM.cyan}}>{line.percent}%</span>
          <span style={{color: TERM.dim}}> {highlighted}</span>
        </div>
      );
  }
}

// ============= TERMINAL PANE =============

const NO_MATCHES: ScrollbackMatch[] = [];

/**
 * One scrollback surface: optional split-mode header, the line scroller,
 * and the prompt-caret input row. Search props only arrive for the
 * primary pane; the split pane renders raw scrollback.
 */
function TerminalPane({
  session,
  header,
  termLength = 0,
  matches = NO_MATCHES,
  activeMatchIndex = -1,
  splitBorder = false,
}: {
  session: TerminalSession;
  header?: ReactNode;
  termLength?: number;
  matches?: ScrollbackMatch[];
  activeMatchIndex?: number;
  splitBorder?: boolean;
}) {
  return (
    <section
      aria-label={\`Session \${session.name}\`}
      style={{
        ...styles.terminalPane,
        ...(splitBorder ? styles.splitDividerPane : undefined),
      }}>
      {header}
      <div style={styles.scroller}>
        {session.lines.map((line, index) => (
          <TermLineRow
            key={index}
            line={line}
            lineIndex={index}
            termLength={termLength}
            matches={matches}
            activeMatchIndex={activeMatchIndex}
          />
        ))}
      </div>
      {/* Prompt caret row — fixture shell, keystrokes are not executed. */}
      <div style={styles.inputRow}>
        <span style={{color: TERM.green}}>
          {USER}@{HOST}
        </span>
        <span style={{color: TERM.blue}}> {session.cwd}</span>
        <span style={{color: TERM.dim}}> ❯</span>
        <span style={styles.caret} aria-hidden="true" />
      </div>
    </section>
  );
}

// ============= SESSION LIST =============

function SessionListRow({
  session,
  isActive,
  hasUnseen,
  onSelect,
}: {
  session: TerminalSession;
  isActive: boolean;
  hasUnseen: boolean;
  onSelect: () => void;
}) {
  const dot = SESSION_STATUS_DOT[session.status];
  return (
    <button
      type="button"
      style={{
        ...styles.sessionRow,
        ...(isActive ? styles.sessionRowActive : undefined),
      }}
      aria-pressed={isActive}
      onClick={onSelect}>
      <StatusDot
        variant={dot.variant}
        label={dot.label}
        isPulsing={dot.isPulsing}
      />
      <StackItem size="fill">
        <VStack gap={0}>
          <Text
            type="body"
            weight={isActive ? 'semibold' : 'normal'}
            maxLines={1}>
            {session.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {session.command} · pid {session.pid}
          </Text>
        </VStack>
      </StackItem>
      {hasUnseen && (
        <Tooltip content="New output since you last viewed this session">
          <span
            style={styles.activityDot}
            role="img"
            aria-label="New output"
          />
        </Tooltip>
      )}
    </button>
  );
}

function SessionList({
  sessions,
  activeSessionId,
  unseenIds,
  onSelectSession,
  onNewSession,
}: {
  sessions: TerminalSession[];
  activeSessionId: string;
  unseenIds: readonly string[];
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}) {
  const runningCount = sessions.filter(s => s.status === 'running').length;
  return (
    <div style={styles.pane}>
      <HStack gap={2} style={styles.paneHeader}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Text type="label" size="sm" color="secondary">
              Sessions
            </Text>
            <Badge variant="neutral" label={String(sessions.length)} />
          </HStack>
        </StackItem>
        <IconButton
          label="New session"
          tooltip="New session"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          onClick={onNewSession}
        />
      </HStack>
      <Divider />
      <div style={styles.paneScroll}>
        {sessions.map(session => (
          <SessionListRow
            key={session.id}
            session={session}
            isActive={session.id === activeSessionId}
            hasUnseen={unseenIds.includes(session.id)}
            onSelect={() => onSelectSession(session.id)}
          />
        ))}
      </div>
      <Divider />
      <div style={styles.paneFootnote}>
        <HStack gap={1} vAlign="center">
          <Icon icon={TerminalIcon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary" maxLines={1}>
            {USER}@{HOST}
          </Text>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {runningCount} running
          </Text>
        </HStack>
      </div>
    </div>
  );
}

// ============= PALETTE ROWS =============

function PaletteSessionRow({
  session,
  segments,
}: {
  session: TerminalSession;
  segments: MatchSegment[];
}) {
  const dot = SESSION_STATUS_DOT[session.status];
  return (
    <HStack gap={3} vAlign="center">
      <Icon icon={SESSION_ICON[session.kind]} size="sm" color="secondary" />
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="body" maxLines={1}>
            <SegmentedLabel segments={segments} />
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {session.command} · {session.cwd}
          </Text>
        </VStack>
      </StackItem>
      <StatusDot
        variant={dot.variant}
        label={dot.label}
        isPulsing={dot.isPulsing}
      />
    </HStack>
  );
}

function PaletteActionRow({
  action,
  segments,
}: {
  action: PaletteAction;
  segments: MatchSegment[];
}) {
  return (
    <HStack gap={3} vAlign="center">
      <Icon icon={action.icon} size="sm" color="secondary" />
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="body" maxLines={1}>
            <SegmentedLabel segments={segments} />
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {action.hint}
          </Text>
        </VStack>
      </StackItem>
      {action.keys != null && <Kbd keys={action.keys} />}
    </HStack>
  );
}

// ============= PAGE =============

export default function CodingTerminalWorkspaceTemplate() {
  const [sessions, setSessions] =
    useState<TerminalSession[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState('ses-shell');
  // Session shown in the right split pane; null = no split.
  const [splitSessionId, setSplitSessionId] = useState<string | null>(null);
  // New-output activity dots: cleared when a session is viewed.
  const [unseenIds, setUnseenIds] = useState<string[]>([
    'ses-server',
    'ses-tests',
  ]);

  // Scrollback search — seeded open on "git" with the second match
  // active so highlights and the counter show immediately.
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('git');
  const [activeMatchIndex, setActiveMatchIndex] = useState(1);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [paletteIndex, setPaletteIndex] = useState(0);

  // Narrow-only sessions drawer (the sidebar collapses behind it).
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const isNarrow = useMediaQuery('(max-width: 640px)');

  const activeSession =
    sessions.find(session => session.id === activeSessionId) ?? sessions[0];
  const splitSession =
    splitSessionId !== null
      ? (sessions.find(session => session.id === splitSessionId) ?? null)
      : null;
  // Split-pane mode is unavailable <=640px per the responsive contract.
  const isSplit = !isNarrow && splitSession !== null;

  // ---- Search derivations ----

  const searchTerm = searchQuery.trim();
  const searchMatches = useMemo(
    () =>
      isSearchOpen
        ? findScrollbackMatches(activeSession.lines, searchQuery)
        : [],
    [isSearchOpen, searchQuery, activeSession],
  );
  // Derived clamp (no effect): retyping can shrink the match list.
  const activeMatch =
    searchMatches.length === 0
      ? -1
      : Math.min(Math.max(activeMatchIndex, 0), searchMatches.length - 1);

  const stepMatch = (step: 1 | -1) => {
    if (searchMatches.length === 0) {
      return;
    }
    const next =
      (activeMatch + step + searchMatches.length) % searchMatches.length;
    setActiveMatchIndex(next);
    setAnnouncement(\`Match \${next + 1} of \${searchMatches.length}\`);
  };

  // ---- Session actions ----

  const markSeen = (id: string) => {
    setUnseenIds(previous => previous.filter(unseenId => unseenId !== id));
  };

  const selectSession = (id: string) => {
    const target = sessions.find(session => session.id === id);
    if (!target) {
      return;
    }
    // Selecting the session already in the split pane swaps the panes
    // instead of showing the same session twice.
    if (splitSessionId === id) {
      setSplitSessionId(activeSessionId);
    }
    setActiveSessionId(id);
    markSeen(id);
    setIsDrawerOpen(false);
    setActiveMatchIndex(0);
    setAnnouncement(\`Switched to session \${target.name}\`);
  };

  const toggleSplit = () => {
    if (splitSessionId !== null) {
      setSplitSessionId(null);
      setAnnouncement('Split view closed');
      return;
    }
    const partner = sessions.find(session => session.id !== activeSessionId);
    if (partner) {
      setSplitSessionId(partner.id);
      markSeen(partner.id);
      setAnnouncement(\`Split view opened with \${partner.name}\`);
    }
  };

  const retargetSplit = (id: string) => {
    setSplitSessionId(id);
    markSeen(id);
    const target = sessions.find(session => session.id === id);
    if (target) {
      setAnnouncement(\`Split pane now shows \${target.name}\`);
    }
  };

  const addSession = () => {
    const scratchCount = sessions.filter(session =>
      session.id.startsWith('ses-scratch-'),
    ).length;
    const serial = scratchCount + 1;
    const id = \`ses-scratch-\${serial}\`;
    setSessions(previous => [
      ...previous,
      {
        id,
        name: \`zsh · \${serial}\`,
        kind: 'shell',
        status: 'running',
        command: 'zsh',
        cwd: HOME_CWD,
        // Fixture pids: deterministic per interaction order.
        pid: 51000 + serial,
        lines: NEW_SESSION_LINES,
      },
    ]);
    if (splitSessionId === null || splitSessionId !== id) {
      setActiveSessionId(id);
    }
    setIsDrawerOpen(false);
    setAnnouncement(\`Started new session zsh · \${serial}\`);
  };

  // ---- Palette ----

  const paletteSections = useMemo(
    () => buildPaletteSections(paletteQuery, sessions, isNarrow),
    [paletteQuery, sessions, isNarrow],
  );
  const flatEntries = useMemo(
    () => paletteSections.flatMap(section => section.entries),
    [paletteSections],
  );
  const highlightedIndex = Math.min(
    Math.max(paletteIndex, 0),
    Math.max(flatEntries.length - 1, 0),
  );

  const openPalette = () => {
    setPaletteQuery('');
    setPaletteIndex(0);
    setIsPaletteOpen(true);
  };

  // mod+K toggles the palette from anywhere on the page.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsPaletteOpen(previous => !previous);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const runPaletteEntry = (entry: PaletteEntry) => {
    setIsPaletteOpen(false);
    if (entry.entryKind === 'session') {
      selectSession(entry.session.id);
      return;
    }
    switch (entry.action.id) {
      case 'act-find':
        setIsSearchOpen(true);
        setAnnouncement('Scrollback search opened');
        break;
      case 'act-toggle-split':
        toggleSplit();
        break;
      case 'act-new-session':
        addSession();
        break;
      case 'act-mark-seen':
        setUnseenIds([]);
        setAnnouncement('All sessions marked as seen');
        break;
    }
  };

  const handlePaletteKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (flatEntries.length === 0) {
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setPaletteIndex(
        (highlightedIndex + step + flatEntries.length) % flatEntries.length,
      );
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const entry = flatEntries[highlightedIndex];
      if (entry) {
        runPaletteEntry(entry);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsPaletteOpen(false);
    }
  };

  // ---- Sidebar / drawer ----

  const sessionList = (
    <SessionList
      sessions={sessions}
      activeSessionId={activeSessionId}
      unseenIds={unseenIds}
      onSelectSession={selectSession}
      onNewSession={addSession}
    />
  );

  // ---- Tab strip ----

  const tabRow = (
    <div style={styles.tabRow}>
      <div style={styles.tabScroller} role="tablist" aria-label="Sessions">
        {sessions.map(session => {
          const isActive = session.id === activeSessionId;
          const hasUnseen = unseenIds.includes(session.id);
          return (
            <button
              key={session.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : undefined),
              }}
              onClick={() => selectSession(session.id)}>
              <Icon
                icon={SESSION_ICON[session.kind]}
                size="sm"
                color={isActive ? 'primary' : 'secondary'}
              />
              <Text
                type="body"
                color="inherit"
                weight={isActive ? 'semibold' : 'normal'}>
                {session.name}
              </Text>
              {hasUnseen && (
                <span
                  style={styles.activityDot}
                  role="img"
                  aria-label="New output"
                  title="New output"
                />
              )}
            </button>
          );
        })}
      </div>
      <div style={styles.tabTools}>
        <IconButton
          label={
            isSearchOpen ? 'Close scrollback search' : 'Search scrollback'
          }
          tooltip="Search scrollback"
          icon={<Icon icon={SearchIcon} size="sm" color="inherit" />}
          variant={isSearchOpen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setIsSearchOpen(open => !open)}
        />
      </div>
    </div>
  );

  // ---- Search bar ----

  const searchBar = isSearchOpen ? (
    <div style={styles.searchBar}>
      <StackItem size="fill">
        <TextInput
          label="Search scrollback"
          isLabelHidden
          size="sm"
          width="100%"
          placeholder="Search the active session's scrollback…"
          startIcon={<Icon icon={SearchIcon} size="sm" color="secondary" />}
          value={searchQuery}
          onChange={value => {
            setSearchQuery(value);
            setActiveMatchIndex(0);
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              stepMatch(event.shiftKey ? -1 : 1);
            }
            if (event.key === 'Escape') {
              setIsSearchOpen(false);
            }
          }}
        />
      </StackItem>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {searchTerm.length === 0
          ? 'Type to search'
          : searchMatches.length === 0
            ? 'No matches'
            : \`\${activeMatch + 1} of \${searchMatches.length}\`}
      </Text>
      <IconButton
        label="Previous match"
        tooltip="Previous match"
        icon={<Icon icon={ChevronUpIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        isDisabled={searchMatches.length === 0}
        onClick={() => stepMatch(-1)}
      />
      <IconButton
        label="Next match"
        tooltip="Next match"
        icon={<Icon icon={ChevronDownIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        isDisabled={searchMatches.length === 0}
        onClick={() => stepMatch(1)}
      />
      <IconButton
        label="Close search"
        tooltip="Close"
        icon={<Icon icon={XIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={() => setIsSearchOpen(false)}
      />
    </div>
  ) : null;

  // ---- Panes ----

  const primaryPaneHeader = isSplit ? (
    <div style={styles.terminalPaneHeader}>
      <span style={{color: TERM.base}}>{activeSession.name}</span>
      <span>· {activeSession.command}</span>
    </div>
  ) : undefined;

  const splitPaneHeader =
    isSplit && splitSession !== null ? (
      <div style={styles.terminalPaneHeader}>
        <span style={{color: TERM.base}}>{splitSession.name}</span>
        <HStack gap={1} vAlign="center">
          {sessions
            .filter(session => session.id !== activeSessionId)
            .map(session => (
              <button
                key={session.id}
                type="button"
                style={{
                  ...styles.paneChip,
                  ...(session.id === splitSession.id
                    ? styles.paneChipActive
                    : undefined),
                }}
                aria-pressed={session.id === splitSession.id}
                onClick={() => retargetSplit(session.id)}>
                {session.name}
              </button>
            ))}
        </HStack>
        <span style={styles.statusSpacer} />
        <IconButton
          label="Close split pane"
          tooltip="Close split"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          onClick={() => setSplitSessionId(null)}
        />
      </div>
    ) : undefined;

  const primaryPane = (
    <TerminalPane
      session={activeSession}
      header={primaryPaneHeader}
      termLength={searchTerm.length}
      matches={searchMatches}
      activeMatchIndex={activeMatch}
    />
  );

  const paneRegion =
    isSplit && splitSession !== null ? (
      <div style={styles.splitGrid}>
        {primaryPane}
        <TerminalPane
          session={splitSession}
          header={splitPaneHeader}
          splitBorder
        />
      </div>
    ) : (
      <div style={styles.paneStack}>{primaryPane}</div>
    );

  // ---- Header ----

  const headerTitle = (
    <HStack gap={2} vAlign="center">
      <Heading level={1}>Terminal Workspace</Heading>
      {!isNarrow && (
        <Text type="supporting" color="secondary">
          {USER}@{HOST} · {HOME_CWD}
        </Text>
      )}
    </HStack>
  );

  const header = isNarrow ? (
    <HStack gap={2} vAlign="center">
      <IconButton
        label={isDrawerOpen ? 'Hide sessions' : 'Show sessions'}
        tooltip="Sessions"
        icon={<Icon icon={PanelLeftIcon} size="sm" color="inherit" />}
        variant={isDrawerOpen ? 'secondary' : 'ghost'}
        size="sm"
        aria-expanded={isDrawerOpen}
        onClick={() => setIsDrawerOpen(open => !open)}
      />
      <StackItem size="fill">{headerTitle}</StackItem>
      <IconButton
        label="Open command palette"
        tooltip="Commands"
        icon={<Icon icon={CommandIcon} size="sm" color="inherit" />}
        variant="secondary"
        size="sm"
        onClick={openPalette}
      />
    </HStack>
  ) : (
    <HStack gap={3} vAlign="center">
      <StackItem size="fill">{headerTitle}</StackItem>
      <ToggleButton
        label="Split view"
        size="sm"
        icon={<Icon icon={Columns2Icon} size="sm" />}
        isPressed={splitSessionId !== null}
        onPressedChange={toggleSplit}
      />
      <Button
        label="Open command palette"
        variant="secondary"
        size="sm"
        icon={<Icon icon={CommandIcon} size="sm" />}
        endContent={
          <HStack gap={2} vAlign="center">
            <Text type="inherit">Commands</Text>
            <Kbd keys="mod+k" />
          </HStack>
        }
        onClick={openPalette}
      />
    </HStack>
  );

  // ---- Status bar ----

  const runningCount = sessions.filter(s => s.status === 'running').length;
  const statusBar = (
    <div style={styles.statusBar}>
      <HStack gap={1} vAlign="center">
        <Icon
          icon={SESSION_ICON[activeSession.kind]}
          size="xsm"
          color="secondary"
        />
        <Text type="supporting" color="secondary" maxLines={1}>
          {activeSession.name}
        </Text>
      </HStack>
      {!isNarrow && (
        <>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            pid {activeSession.pid}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            80×24
          </Text>
          <Text type="supporting" color="secondary">
            UTF-8
          </Text>
        </>
      )}
      <span style={styles.statusSpacer} />
      {isSearchOpen && searchTerm.length > 0 && (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {searchMatches.length}{' '}
          {searchMatches.length === 1 ? 'match' : 'matches'}
        </Text>
      )}
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {sessions.length} sessions · {runningCount} running
      </Text>
    </div>
  );

  // ---- Frame ----

  const workspacePage = (
    <Layout
      height="fill"
      header={<LayoutHeader hasDivider>{header}</LayoutHeader>}
      start={
        !isNarrow ? (
          <LayoutPanel width={250} padding={0} label="Sessions">
            {sessionList}
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div style={styles.terminalColumn}>
            {isNarrow && isDrawerOpen && (
              <div style={styles.sessionDrawer}>{sessionList}</div>
            )}
            {tabRow}
            {searchBar}
            {paneRegion}
          </div>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider padding={0} label="Status bar">
          {statusBar}
        </LayoutFooter>
      }
    />
  );

  // ---- Command palette overlay ----

  let flatIndex = -1;
  const palette = (
    // Clicking the dimmed area (not the palette itself) closes.
    <div
      style={styles.paletteLayer}
      onClick={event => {
        if (event.target === event.currentTarget) {
          setIsPaletteOpen(false);
        }
      }}>
      <Card
        width={640}
        maxWidth="100%"
        padding={0}
        style={styles.paletteCard}
        role="dialog"
        aria-label="Command palette">
        <CommandPaletteInput
          value={paletteQuery}
          onValueChange={value => {
            setPaletteQuery(value);
            setPaletteIndex(0);
          }}
          placeholder="Switch session or run a workspace action…"
          onKeyDown={handlePaletteKeyDown}
          endContent={<Kbd keys="mod+k" />}
        />
        <Divider />
        <CommandPaletteList label="Palette results" style={styles.resultList}>
          {flatEntries.length === 0 ? (
            <CommandPaletteEmpty>
              No sessions or actions match “{paletteQuery.trim()}”.
            </CommandPaletteEmpty>
          ) : (
            paletteSections.map(section => (
              <CommandPaletteGroup key={section.id} heading={section.heading}>
                {section.entries.map(entry => {
                  flatIndex += 1;
                  const index = flatIndex;
                  return (
                    <CommandPaletteItem
                      key={entry.id}
                      value={entry.id}
                      isHighlighted={index === highlightedIndex}
                      onSelect={() => runPaletteEntry(entry)}
                      onMouseEnter={() => setPaletteIndex(index)}>
                      {entry.entryKind === 'session' ? (
                        <PaletteSessionRow
                          session={entry.session}
                          segments={entry.segments}
                        />
                      ) : (
                        <PaletteActionRow
                          action={entry.action}
                          segments={entry.segments}
                        />
                      )}
                    </CommandPaletteItem>
                  );
                })}
              </CommandPaletteGroup>
            ))
          )}
        </CommandPaletteList>
        <Divider />
        <CommandPaletteFooter>
          <HStack gap={3} vAlign="center">
            <HStack gap={1} vAlign="center">
              <Kbd keys="up" />
              <Kbd keys="down" />
              <Text type="inherit">navigate</Text>
            </HStack>
            <HStack gap={1} vAlign="center">
              <Kbd keys="enter" />
              <Text type="inherit">run</Text>
            </HStack>
            <HStack gap={1} vAlign="center">
              <Kbd keys="escape" />
              <Text type="inherit">close</Text>
            </HStack>
            <StackItem size="fill" />
            {!isNarrow && (
              <Text type="inherit">fixture sessions — nothing executes</Text>
            )}
          </HStack>
        </CommandPaletteFooter>
      </Card>
    </div>
  );

  return (
    <div style={styles.root}>
      {isPaletteOpen ? (
        <Overlay
          isOpen
          scrim="dark"
          position="fill"
          align="start"
          style={styles.overlay}
          content={palette}>
          {workspacePage}
        </Overlay>
      ) : (
        workspacePage
      )}
    </div>
  );
}
`;export{e as default};