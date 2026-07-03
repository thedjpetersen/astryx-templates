// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (explorer tree with git statuses, six
 *   token-tinted source files, a problems list with fixed line/col anchors —
 *   no clocks, randomness, or network assets)
 * @output IDE editor shell: a 260px explorer rail (folder TreeList with
 *   git-status dots), an editor tab strip with dirty-dot indicators and
 *   per-tab close buttons, a code viewport with line-number gutter,
 *   fixture syntax-toned content that swaps per tab, and a decorative
 *   minimap strip, a collapsible problems panel whose rows jump selection,
 *   and a status bar (branch, lint counts, cursor position, language)
 * @position Page template; emitted by `astryx template editor-file-tabs-shell`
 *
 * Frame: Layout height="fill". LayoutHeader carries the product title and
 * (narrow only) the Explorer/Editor SegmentedControl. LayoutPanel start
 * (260px, padding 0) is the explorer rail. LayoutContent is the editor
 * column — tab strip, viewport, docked problems panel. LayoutFooter is the
 * status bar. All chrome is fixed; only the viewport and problems list
 * scroll.
 *
 * Responsive contract:
 * - >640px: explorer rail fixed at 260px (LayoutPanel start); the editor
 *   column fills the rest with the minimap strip on its right edge. The
 *   header keeps title and actions on one row.
 * - <=640px: single-pane fallback — the rail leaves the flow and a header
 *   SegmentedControl swaps the whole content region between Explorer and
 *   Editor; opening a file from the tree jumps back to the editor. The
 *   minimap and the status-bar encoding/EOL cells hide; branch, problem
 *   counts, cursor, and language stay. Everything is usable at 375px.
 * - Tab strip: overflowX auto at every width — tabs keep their intrinsic
 *   width and the strip scrolls rather than crushing labels. Code lines
 *   never wrap (white-space: pre); the viewport scrolls horizontally.
 * - Tap targets: tabs, tab close buttons, the problems-panel header, and
 *   the status-bar problems toggle are all >=40px tall. Nothing is
 *   hover-only — close buttons and git dots are always visible.
 *
 * Container policy: dense tool chrome — no Cards. The explorer, tab strip,
 * viewport, problems panel, and status bar are bordered rows/panels; the
 * problems list is a compact List; the tree is a TreeList.
 *
 * Interaction contract:
 * - Clicking a file in the tree opens (or focuses) its tab; the tree row
 *   highlights to follow the active editor.
 * - Tabs select on click; the X closes (closing the active tab activates
 *   its left neighbor; closing the last tab shows an empty-editor state).
 * - Clicking a code line moves the cursor there (status bar updates);
 *   cursor position is remembered per file across tab switches.
 * - Problem rows jump selection: they open the file's tab, move the cursor
 *   to the problem's line/col, and announce the jump via a visually-hidden
 *   live region. Problem lines get tinted gutter numbers + wavy underline.
 * - The problems panel collapses from its own header and from the
 *   status-bar error/warning counter; both stay in sync (one state).
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  BracesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleXIcon,
  FileCodeIcon,
  FilesIcon,
  FileTextIcon,
  FolderIcon,
  GitBranchIcon,
  PaletteIcon,
  PlayIcon,
  SettingsIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

// Monospace metrics come from the same tokens Code/CodeBlock use, so the
// viewport reads as one surface with any CodeBlock elsewhere in the product.
const mono: CSSProperties = {
  fontFamily: 'var(--font-family-code)',
  fontSize: 'var(--text-code-size)',
  lineHeight: 'var(--text-code-leading)',
};

const styles: Record<string, CSSProperties> = {
  // ---- Explorer rail ----
  pane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  explorerHeader: {
    alignItems: 'center',
    padding: 'var(--spacing-2) var(--spacing-3)',
    minHeight: 40,
    boxSizing: 'border-box',
  },
  paneScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-2) var(--spacing-3)',
  },
  paneFootnote: {
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  gitDot: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
  gitDotCircle: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  gitDotLetter: {
    ...mono,
    fontSize: 'var(--text-supporting-size)',
  },

  // ---- Editor column ----
  editorColumn: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  // Tabs keep intrinsic width; the strip scrolls instead of crushing labels.
  tabStrip: {
    display: 'flex',
    overflowX: 'auto',
    flexShrink: 0,
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    minHeight: 40,
    padding: '0 var(--spacing-1) 0 var(--spacing-3)',
    borderRight: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  tabActive: {
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
    boxShadow: 'inset 0 2px 0 0 var(--color-accent)',
  },
  tabSelect: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 40,
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  dirtyDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    flexShrink: 0,
  },

  // ---- Code viewport ----
  viewport: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    backgroundColor: 'var(--color-background-card)',
  },
  codeScroller: {
    flex: 1,
    minWidth: 0,
    overflow: 'auto',
    padding: 'var(--spacing-2) 0',
  },
  codeLine: {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
    // Extends the active-line tint across the horizontally scrolled width.
    minWidth: 'max-content',
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
  },
  codeLineActive: {
    backgroundColor: 'var(--color-accent-muted)',
  },
  gutter: {
    ...mono,
    width: 40,
    flexShrink: 0,
    padding: '0 var(--spacing-2)',
    textAlign: 'right',
    color: 'var(--color-text-secondary)',
    userSelect: 'none',
    boxSizing: 'content-box',
    borderRight: 'var(--border-width) solid var(--color-border)',
  },
  codeText: {
    ...mono,
    whiteSpace: 'pre',
    padding: '0 var(--spacing-4) 0 var(--spacing-3)',
    color: 'var(--color-text-primary)',
  },
  squiggleError: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'wavy',
    textDecorationColor: 'var(--color-error)',
    textDecorationThickness: 1,
    textUnderlineOffset: 4,
  },
  squiggleWarning: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'wavy',
    textDecorationColor: 'var(--color-warning)',
    textDecorationThickness: 1,
    textUnderlineOffset: 4,
  },

  // ---- Minimap (decorative) ----
  minimap: {
    position: 'relative',
    width: 64,
    flexShrink: 0,
    borderLeft: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-2) var(--spacing-1)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflow: 'hidden',
  },
  minimapLine: {
    height: 2,
    borderRadius: 1,
    opacity: 0.5,
    flexShrink: 0,
  },
  minimapViewport: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'var(--color-overlay-hover)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    pointerEvents: 'none',
  },

  // ---- Problems panel ----
  problems: {
    flexShrink: 0,
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
  },
  problemsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 40,
    border: 'none',
    background: 'transparent',
    padding: '0 var(--spacing-3)',
    margin: 0,
    cursor: 'pointer',
    font: 'inherit',
    textAlign: 'left',
  },
  problemsList: {
    maxHeight: 190,
    overflowY: 'auto',
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: '0 var(--spacing-2) var(--spacing-2)',
  },
  severityIcon: {
    display: 'inline-flex',
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
  statusGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
  statusButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    minHeight: 40,
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    font: 'inherit',
  },
  statusSpacer: {
    flex: 1,
  },
  emptyEditorFill: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-card)',
    overflowY: 'auto',
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

// ============= SYNTAX FIXTURES =============

// Fixture "syntax highlighting": each line is a fixed list of toned tokens.
// A real editor plugs a tokenizer in here; the fixture keeps the token
// stream hand-authored so rendering is fully deterministic.
type Tone =
  | 'plain'
  | 'keyword'
  | 'string'
  | 'comment'
  | 'number'
  | 'type'
  | 'fn'
  | 'prop';

interface Token {
  tone: Tone;
  text: string;
}

type TokenLine = Token[];

const TONE_COLOR: Record<Tone, string> = {
  plain: 'var(--color-text-primary)',
  keyword: 'var(--color-text-purple)',
  string: 'var(--color-text-green)',
  comment: 'var(--color-syntax-comment)',
  number: 'var(--color-text-orange)',
  type: 'var(--color-text-teal)',
  fn: 'var(--color-text-blue)',
  prop: 'var(--color-text-cyan)',
};

// Shorthand token constructors keep the fixture sources readable.
const t = (text: string): Token => ({tone: 'plain', text});
const kw = (text: string): Token => ({tone: 'keyword', text});
const st = (text: string): Token => ({tone: 'string', text});
const cm = (text: string): Token => ({tone: 'comment', text});
const nm = (text: string): Token => ({tone: 'number', text});
const ty = (text: string): Token => ({tone: 'type', text});
const fnc = (text: string): Token => ({tone: 'fn', text});
const pr = (text: string): Token => ({tone: 'prop', text});

// src/session/refresh.ts — carries both type errors (lines 13 and 25).
const REFRESH_TS: TokenLine[] = [
  [kw('import'), t(' {clock} '), kw('from'), t(' '), st("'../lib/clock'"), t(';')],
  [kw('import'), t(' {getSession, saveSession} '), kw('from'), t(' '), st("'./store'"), t(';')],
  [kw('import type'), t(' {'), ty('Session'), t('} '), kw('from'), t(' '), st("'./types'"), t(';')],
  [],
  [kw('const'), t(' REFRESH_WINDOW_MS = '), nm('5'), t(' * '), nm('60_000'), t(';')],
  [],
  [cm('/** Refresh a session when it is inside the expiry window. */')],
  [kw('export'), t(' '), kw('async function'), t(' '), fnc('refreshSession'), t('(id: '), ty('string'), t('): '), ty('Promise'), t('<'), ty('Session'), t('> {')],
  [t('  '), kw('const'), t(' session = '), kw('await'), t(' '), fnc('getSession'), t('(id);')],
  [t('  '), kw('if'), t(' (session === '), kw('null'), t(') {')],
  [t('    '), kw('throw new'), t(' '), ty('Error'), t('('), st("'No session for id '"), t(' + id);')],
  [t('  }')],
  [t('  '), kw('const'), t(' remaining = session.'), pr('expiresAt'), t(' - clock.'), fnc('now'), t('();')],
  [t('  '), kw('if'), t(' (remaining > REFRESH_WINDOW_MS) {')],
  [t('    '), kw('return'), t(' session;')],
  [t('  }')],
  [t('  '), kw('const'), t(' response = '), kw('await'), t(' '), fnc('fetch'), t('('), st("'/api/session/refresh'"), t(', {')],
  [t('    '), pr('method'), t(': '), st("'POST'"), t(',')],
  [t('    '), pr('headers'), t(': {'), st("'content-type'"), t(': '), st("'application/json'"), t('},')],
  [t('    '), pr('body'), t(': JSON.'), fnc('stringify'), t('({id}),')],
  [t('  });')],
  [t('  '), kw('if'), t(' (!response.'), pr('ok'), t(') {')],
  [t('    '), kw('throw new'), t(' '), ty('Error'), t('('), st("'Refresh failed: '"), t(' + response.'), pr('status'), t(');')],
  [t('  }')],
  [t('  '), kw('return'), t(' '), fnc('saveSession'), t('(response.'), pr('headers'), t('.'), fnc('get'), t('('), st("'x-session-token'"), t('));')],
  [t('}')],
];

// src/components/UploadButton.tsx — exhaustive-deps + unused-var warnings.
const UPLOAD_BUTTON_TSX: TokenLine[] = [
  [kw('import'), t(' {useEffect, useRef, useState} '), kw('from'), t(' '), st("'react'"), t(';')],
  [],
  [kw('interface'), t(' '), ty('UploadButtonProps'), t(' {')],
  [t('  '), pr('accept'), t(': '), ty('string'), t(';')],
  [t('  '), pr('onUpload'), t(': (file: '), ty('File'), t(') => '), ty('void'), t(';')],
  [t('}')],
  [],
  [kw('export function'), t(' '), fnc('UploadButton'), t('({accept, onUpload}: '), ty('UploadButtonProps'), t(') {')],
  [t('  '), kw('const'), t(' inputRef = '), fnc('useRef'), t('<'), ty('HTMLInputElement'), t('>('), kw('null'), t(');')],
  [t('  '), kw('const'), t(' [isDragging, setIsDragging] = '), fnc('useState'), t('('), kw('false'), t(');')],
  [],
  [t('  '), fnc('useEffect'), t('(() => {')],
  [t('    '), kw('const'), t(' input = inputRef.'), pr('current'), t(';')],
  [t('    '), kw('if'), t(' (input === '), kw('null'), t(') {')],
  [t('      '), kw('return'), t(';')],
  [t('    }')],
  [t('    '), kw('const'), t(' handle = () => {')],
  [t('      '), kw('const'), t(' file = input.'), pr('files'), t('?.['), nm('0'), t('];')],
  [t('      '), kw('if'), t(' (file !== '), kw('undefined'), t(') {')],
  [t('        '), fnc('onUpload'), t('(file);')],
  [t('      }')],
  [t('    };')],
  [t('    input.'), fnc('addEventListener'), t('('), st("'change'"), t(', handle);')],
  [t('    '), kw('return'), t(' () => input.'), fnc('removeEventListener'), t('('), st("'change'"), t(', handle);')],
  [t('  }, []);')],
  [],
  [t('  '), kw('return'), t(' (')],
  [t('    <'), ty('button'), t(' '), pr('type'), t('='), st('"button"'), t(' '), pr('onClick'), t('={() => inputRef.'), pr('current'), t('?.'), fnc('click'), t('()}>')],
  [t('      {isDragging ? '), st("'Drop to upload'"), t(' : '), st("'Upload file'"), t('}')],
  [t('      <'), ty('input'), t(' '), pr('ref'), t('={inputRef} '), pr('type'), t('='), st('"file"'), t(' '), pr('accept'), t('={accept} '), pr('hidden'), t(' />')],
  [t('    </'), ty('button'), t('>')],
  [t('  );')],
  [t('}')],
];

// src/lib/format.ts — clean file, no markers.
const FORMAT_TS: TokenLine[] = [
  [kw('const'), t(' BYTE_UNITS = ['), st("'B'"), t(', '), st("'KB'"), t(', '), st("'MB'"), t(', '), st("'GB'"), t('] '), kw('as const'), t(';')],
  [],
  [cm('/** Format a byte count with one decimal, e.g. 1.4 MB. */')],
  [kw('export function'), t(' '), fnc('formatBytes'), t('(bytes: '), ty('number'), t('): '), ty('string'), t(' {')],
  [t('  '), kw('let'), t(' value = bytes;')],
  [t('  '), kw('let'), t(' unit = '), nm('0'), t(';')],
  [t('  '), kw('while'), t(' (value >= '), nm('1024'), t(' && unit < BYTE_UNITS.'), pr('length'), t(' - '), nm('1'), t(') {')],
  [t('    value /= '), nm('1024'), t(';')],
  [t('    unit += '), nm('1'), t(';')],
  [t('  }')],
  [t('  '), kw('const'), t(' rounded = unit === '), nm('0'), t(' ? '), ty('String'), t('(value) : value.'), fnc('toFixed'), t('('), nm('1'), t(');')],
  [t('  '), kw('return'), t(' rounded + '), st("' '"), t(' + BYTE_UNITS[unit];')],
  [t('}')],
  [],
  [cm('/** Format a duration in ms as m:ss for the upload toast. */')],
  [kw('export function'), t(' '), fnc('formatDuration'), t('(totalMs: '), ty('number'), t('): '), ty('string'), t(' {')],
  [t('  '), kw('const'), t(' seconds = Math.'), fnc('round'), t('(totalMs / '), nm('1000'), t(');')],
  [t('  '), kw('const'), t(' minutes = Math.'), fnc('floor'), t('(seconds / '), nm('60'), t(');')],
  [t('  '), kw('const'), t(' rest = '), ty('String'), t('(seconds % '), nm('60'), t(').'), fnc('padStart'), t('('), nm('2'), t(', '), st("'0'"), t(');')],
  [t('  '), kw('return'), t(' minutes + '), st("':'"), t(' + rest;')],
  [t('}')],
];

// src/styles/tokens.css — untracked; duplicate custom property on line 8.
const TOKENS_CSS: TokenLine[] = [
  [ty(':root'), t(' {')],
  [t('  '), pr('--surface-raised'), t(': '), st('#ffffff'), t(';')],
  [t('  '), pr('--surface-sunken'), t(': '), st('#f4f5f7'), t(';')],
  [t('  '), pr('--elevation-1'), t(': '), nm('0 1px 2px'), t(' '), fnc('rgb'), t('('), nm('16 24 40'), t(' / '), nm('8%'), t(');')],
  [t('  '), pr('--elevation-2'), t(': '), nm('0 4px 8px'), t(' '), fnc('rgb'), t('('), nm('16 24 40'), t(' / '), nm('10%'), t(');')],
  [t('  '), pr('--radius-pill'), t(': '), nm('999px'), t(';')],
  [t('  '), pr('--focus-ring'), t(': '), nm('0 0 0 2px'), t(' '), st('#4f7cff'), t(';')],
  [t('  '), pr('--elevation-2'), t(': '), nm('0 6px 12px'), t(' '), fnc('rgb'), t('('), nm('16 24 40'), t(' / '), nm('12%'), t(');')],
  [t('}')],
  [],
  [ty('.upload-button'), t(' {')],
  [t('  '), pr('border-radius'), t(': '), fnc('var'), t('('), pr('--radius-pill'), t(');')],
  [t('  '), pr('box-shadow'), t(': '), fnc('var'), t('('), pr('--elevation-1'), t(');')],
  [t('}')],
];

// README.md — clean documentation file.
const README_MD: TokenLine[] = [
  [kw('# orbit-console')],
  [],
  [t('Web console for the Orbit file-sync service.')],
  [],
  [kw('## Getting started')],
  [],
  [nm('1.'), t(' Install dependencies with '), st('pnpm install')],
  [nm('2.'), t(' Run '), st('pnpm dev'), t(', then open localhost:5173')],
  [],
  [kw('## Layout')],
  [],
  [t('- '), pr('src/components'), t(' — UI building blocks')],
  [t('- '), pr('src/session'), t(' — auth and session lifecycle')],
  [t('- '), pr('src/lib'), t(' — shared formatting helpers')],
];

// package.json — clean manifest.
const PACKAGE_JSON: TokenLine[] = [
  [t('{')],
  [t('  '), pr('"name"'), t(': '), st('"orbit-console"'), t(',')],
  [t('  '), pr('"version"'), t(': '), st('"0.4.2"'), t(',')],
  [t('  '), pr('"private"'), t(': '), kw('true'), t(',')],
  [t('  '), pr('"scripts"'), t(': {')],
  [t('    '), pr('"dev"'), t(': '), st('"vite"'), t(',')],
  [t('    '), pr('"build"'), t(': '), st('"vite build"'), t(',')],
  [t('    '), pr('"lint"'), t(': '), st('"eslint src --max-warnings 0"')],
  [t('  },')],
  [t('  '), pr('"dependencies"'), t(': {')],
  [t('    '), pr('"react"'), t(': '), st('"^19.0.0"'), t(',')],
  [t('    '), pr('"react-dom"'), t(': '), st('"^19.0.0"')],
  [t('  }')],
  [t('}')],
];

// ============= DATA =============

type Language = 'typescript' | 'tsx' | 'css' | 'markdown' | 'json';
type GitStatus = 'modified' | 'added' | 'untracked' | 'clean';

interface EditorFile {
  id: string;
  /** Full path from the workspace root, e.g. 'src/session/refresh.ts'. */
  path: string;
  language: Language;
  git: GitStatus;
  /** Unsaved-changes marker shown as the tab dirty dot. */
  isDirty: boolean;
  lines: TokenLine[];
}

const FILES: Record<string, EditorFile> = {
  'file-refresh': {
    id: 'file-refresh',
    path: 'src/session/refresh.ts',
    language: 'typescript',
    git: 'modified',
    isDirty: true,
    lines: REFRESH_TS,
  },
  'file-upload-button': {
    id: 'file-upload-button',
    path: 'src/components/UploadButton.tsx',
    language: 'tsx',
    git: 'modified',
    isDirty: true,
    lines: UPLOAD_BUTTON_TSX,
  },
  'file-format': {
    id: 'file-format',
    path: 'src/lib/format.ts',
    language: 'typescript',
    git: 'clean',
    isDirty: false,
    lines: FORMAT_TS,
  },
  'file-tokens-css': {
    id: 'file-tokens-css',
    path: 'src/styles/tokens.css',
    language: 'css',
    git: 'untracked',
    isDirty: false,
    lines: TOKENS_CSS,
  },
  'file-readme': {
    id: 'file-readme',
    path: 'README.md',
    language: 'markdown',
    git: 'clean',
    isDirty: false,
    lines: README_MD,
  },
  'file-package': {
    id: 'file-package',
    path: 'package.json',
    language: 'json',
    git: 'clean',
    isDirty: false,
    lines: PACKAGE_JSON,
  },
};

const LANGUAGE_LABEL: Record<Language, string> = {
  typescript: 'TypeScript',
  tsx: 'TypeScript JSX',
  css: 'CSS',
  markdown: 'Markdown',
  json: 'JSON',
};

const LANGUAGE_ICON: Record<Language, typeof FileCodeIcon> = {
  typescript: FileCodeIcon,
  tsx: FileCodeIcon,
  css: PaletteIcon,
  markdown: FileTextIcon,
  json: BracesIcon,
};

// Git-status dot styling — letter + colored dot, always visible (VS Code
// idiom). Clean files render no marker at all.
const GIT_MARKER: Record<
  Exclude<GitStatus, 'clean'>,
  {letter: string; color: string; label: string}
> = {
  modified: {letter: 'M', color: 'var(--color-text-orange)', label: 'Modified'},
  added: {letter: 'A', color: 'var(--color-text-teal)', label: 'Added'},
  untracked: {
    letter: 'U',
    color: 'var(--color-text-green)',
    label: 'Untracked',
  },
};

/** Explorer tree shape: directories declared, files reference FILES. */
type TreeSpecNode =
  | {kind: 'dir'; id: string; label: string; children: TreeSpecNode[]}
  | {kind: 'file'; fileId: string};

const EXPLORER_TREE: TreeSpecNode[] = [
  {
    kind: 'dir',
    id: 'dir-src',
    label: 'src',
    children: [
      {
        kind: 'dir',
        id: 'dir-components',
        label: 'components',
        children: [{kind: 'file', fileId: 'file-upload-button'}],
      },
      {
        kind: 'dir',
        id: 'dir-lib',
        label: 'lib',
        children: [{kind: 'file', fileId: 'file-format'}],
      },
      {
        kind: 'dir',
        id: 'dir-session',
        label: 'session',
        children: [{kind: 'file', fileId: 'file-refresh'}],
      },
      {
        kind: 'dir',
        id: 'dir-styles',
        label: 'styles',
        children: [{kind: 'file', fileId: 'file-tokens-css'}],
      },
    ],
  },
  {kind: 'file', fileId: 'file-package'},
  {kind: 'file', fileId: 'file-readme'},
];

interface Problem {
  id: string;
  severity: 'error' | 'warning';
  fileId: string;
  line: number;
  col: number;
  message: string;
  /** Diagnostic source shown after the message, e.g. ts(2339). */
  source: string;
}

// Fixed diagnostics — line/col anchors match the token fixtures above.
const PROBLEMS: Problem[] = [
  {
    id: 'problem-expires-at',
    severity: 'error',
    fileId: 'file-refresh',
    line: 13,
    col: 29,
    message: "Property 'expiresAt' does not exist on type 'Session'.",
    source: 'ts(2339)',
  },
  {
    id: 'problem-nullable-token',
    severity: 'error',
    fileId: 'file-refresh',
    line: 25,
    col: 22,
    message:
      "Argument of type 'string | null' is not assignable to parameter of type 'string'.",
    source: 'ts(2345)',
  },
  {
    id: 'problem-unused-setter',
    severity: 'warning',
    fileId: 'file-upload-button',
    line: 10,
    col: 22,
    message: "'setIsDragging' is assigned a value but never used.",
    source: 'eslint(no-unused-vars)',
  },
  {
    id: 'problem-missing-dep',
    severity: 'warning',
    fileId: 'file-upload-button',
    line: 25,
    col: 6,
    message: "React Hook useEffect has a missing dependency: 'onUpload'.",
    source: 'eslint(react-hooks/exhaustive-deps)',
  },
  {
    id: 'problem-duplicate-property',
    severity: 'warning',
    fileId: 'file-tokens-css',
    line: 8,
    col: 3,
    message: "Unexpected duplicate custom property '--elevation-2'.",
    source: 'stylelint(declaration-block-no-duplicate-custom-properties)',
  },
];

const ERROR_COUNT = PROBLEMS.filter(p => p.severity === 'error').length;
const WARNING_COUNT = PROBLEMS.filter(p => p.severity === 'warning').length;
const CHANGED_FILE_COUNT = Object.values(FILES).filter(
  file => file.git !== 'clean',
).length;

// Per-line severity lookup for gutters and squiggles; errors win when an
// error and a warning land on the same line.
const PROBLEM_LINES: Record<string, 'error' | 'warning'> = {};
for (const problem of PROBLEMS) {
  const key = `${problem.fileId}:${problem.line}`;
  if (PROBLEM_LINES[key] !== 'error') {
    PROBLEM_LINES[key] = problem.severity;
  }
}

const BRANCH = 'feat/upload-retry';
const WORKSPACE = 'orbit-console';

function fileName(path: string): string {
  const segments = path.split('/');
  return segments[segments.length - 1];
}

// ============= SMALL RENDERERS =============

/** Explorer git-status marker: colored dot + letter, with an aria label. */
function GitDot({status}: {status: GitStatus}) {
  if (status === 'clean') {
    return null;
  }
  const marker = GIT_MARKER[status];
  return (
    <span
      style={styles.gitDot}
      role="img"
      aria-label={marker.label}
      title={marker.label}>
      <span
        aria-hidden="true"
        style={{...styles.gitDotCircle, backgroundColor: marker.color}}
      />
      <span
        aria-hidden="true"
        style={{...styles.gitDotLetter, color: marker.color}}>
        {marker.letter}
      </span>
    </span>
  );
}

function severityColor(severity: 'error' | 'warning'): string {
  return severity === 'error' ? 'var(--color-error)' : 'var(--color-warning)';
}

/** One rendered code line: gutter number + toned tokens, click-to-place-cursor. */
function CodeLine({
  file,
  lineIndex,
  isActive,
  onSelect,
}: {
  file: EditorFile;
  lineIndex: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const lineNumber = lineIndex + 1;
  const severity = PROBLEM_LINES[`${file.id}:${lineNumber}`];
  const tokens = file.lines[lineIndex];
  const squiggle =
    severity === 'error'
      ? styles.squiggleError
      : severity === 'warning'
        ? styles.squiggleWarning
        : undefined;
  return (
    <button
      type="button"
      style={{
        ...styles.codeLine,
        ...(isActive ? styles.codeLineActive : undefined),
      }}
      onClick={onSelect}>
      <span
        style={{
          ...styles.gutter,
          ...(severity !== undefined
            ? {color: severityColor(severity), fontWeight: 600}
            : isActive
              ? {color: 'var(--color-text-primary)'}
              : undefined),
        }}>
        {lineNumber}
      </span>
      <span style={{...styles.codeText, ...squiggle}}>
        {tokens.length === 0
          ? ' '
          : tokens.map((token, index) => (
              <span key={index} style={{color: TONE_COLOR[token.tone]}}>
                {token.text}
              </span>
            ))}
      </span>
    </button>
  );
}

/**
 * Decorative minimap strip: bar widths derive from the fixture line
 * lengths, bar color from the first non-plain tone, and the translucent
 * viewport box tracks the cursor line — all deterministic, all aria-hidden.
 */
function Minimap({file, cursorLine}: {file: EditorFile; cursorLine: number}) {
  const total = Math.max(file.lines.length, 1);
  const viewportTop = Math.min(((cursorLine - 1) / total) * 100, 88);
  return (
    <div aria-hidden="true" style={styles.minimap}>
      <div style={{...styles.minimapViewport, top: `${viewportTop}%`}} />
      {file.lines.map((line, index) => {
        const length = line.reduce((sum, token) => sum + token.text.length, 0);
        const tone = line.find(token => token.tone !== 'plain')?.tone ?? 'plain';
        return (
          <div
            key={index}
            style={{
              ...styles.minimapLine,
              width: `${Math.min(92, 8 + length * 1.3)}%`,
              backgroundColor: TONE_COLOR[tone],
            }}
          />
        );
      })}
    </div>
  );
}

// ============= TREE BUILDING =============

function buildTreeItems(
  specs: TreeSpecNode[],
  activeId: string | null,
  onOpen: (fileId: string) => void,
): TreeListItemData[] {
  return specs.map(spec => {
    if (spec.kind === 'dir') {
      return {
        id: spec.id,
        label: spec.label,
        isExpanded: true,
        startContent: <Icon icon={FolderIcon} size="sm" color="secondary" />,
        children: buildTreeItems(spec.children, activeId, onOpen),
      };
    }
    const file = FILES[spec.fileId];
    return {
      id: file.id,
      label: fileName(file.path),
      startContent: (
        <Icon
          icon={LANGUAGE_ICON[file.language]}
          size="sm"
          color="secondary"
        />
      ),
      endContent: <GitDot status={file.git} />,
      isSelected: file.id === activeId,
      onClick: () => onOpen(file.id),
    };
  });
}

// ============= PAGE =============

type MobileView = 'explorer' | 'editor';

export default function EditorFileTabsShellTemplate() {
  // Three tabs start open with refresh.ts active — the error file, so the
  // problems panel, squiggles, and dirty dots are all on display at once.
  const [openTabIds, setOpenTabIds] = useState<string[]>([
    'file-refresh',
    'file-upload-button',
    'file-format',
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>('file-refresh');
  // Cursor is remembered per file so tab switches round-trip position.
  const [cursorByFile, setCursorByFile] = useState<
    Record<string, {line: number; col: number}>
  >({'file-refresh': {line: 13, col: 29}});
  const [isProblemsOpen, setIsProblemsOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  // Mobile contract: one pane at a time, swapped by a header control.
  const [mobileView, setMobileView] = useState<MobileView>('editor');
  const isNarrow = useMediaQuery('(max-width: 640px)');

  const activeFile = activeTabId !== null ? FILES[activeTabId] : null;
  const cursor =
    activeFile !== null
      ? (cursorByFile[activeFile.id] ?? {line: 1, col: 1})
      : null;

  const openFile = (fileId: string) => {
    setOpenTabIds(prev => (prev.includes(fileId) ? prev : [...prev, fileId]));
    setActiveTabId(fileId);
    setMobileView('editor');
  };

  const closeTab = (fileId: string) => {
    const index = openTabIds.indexOf(fileId);
    if (index < 0) {
      return;
    }
    const next = openTabIds.filter(id => id !== fileId);
    setOpenTabIds(next);
    if (fileId === activeTabId) {
      // Activate the left neighbor, VS Code style; null empties the editor.
      setActiveTabId(next.length === 0 ? null : next[index === 0 ? 0 : index - 1]);
    }
  };

  const placeCursor = (fileId: string, line: number, col: number) => {
    setCursorByFile(prev => ({...prev, [fileId]: {line, col}}));
  };

  const jumpToProblem = (problem: Problem) => {
    openFile(problem.fileId);
    placeCursor(problem.fileId, problem.line, problem.col);
    setAnnouncement(
      `Jumped to ${FILES[problem.fileId].path}, line ${problem.line}`,
    );
  };

  const treeItems = useMemo(
    () => buildTreeItems(EXPLORER_TREE, activeTabId, openFile),
    // openFile is recreated per render but only touches setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTabId],
  );

  // ---- Explorer rail ----

  const explorerPane = (
    <div style={styles.pane}>
      <HStack gap={2} style={styles.explorerHeader}>
        <StackItem size="fill">
          <Text type="label" size="sm" color="secondary">
            Explorer
          </Text>
        </StackItem>
        <Badge variant="warning" label={`${CHANGED_FILE_COUNT} changed`} />
      </HStack>
      <Divider />
      <div style={styles.paneScroll}>
        <TreeList
          density="compact"
          items={treeItems}
          header={
            <Text type="label" size="sm" color="secondary">
              {WORKSPACE} · {BRANCH}
            </Text>
          }
        />
      </div>
      <Divider />
      <div style={styles.paneFootnote}>
        <HStack gap={1} vAlign="center">
          <Icon icon={GitBranchIcon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary" maxLines={1}>
            {BRANCH}
          </Text>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            ↑2 ↓0
          </Text>
        </HStack>
      </div>
    </div>
  );

  // ---- Tab strip ----

  const tabStrip = (
    <div style={styles.tabStrip} role="tablist" aria-label="Open editors">
      {openTabIds.map(fileId => {
        const file = FILES[fileId];
        const name = fileName(file.path);
        const isActive = fileId === activeTabId;
        return (
          <div
            key={fileId}
            style={{
              ...styles.tab,
              ...(isActive ? styles.tabActive : undefined),
            }}>
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              style={styles.tabSelect}
              onClick={() => setActiveTabId(fileId)}>
              <Icon
                icon={LANGUAGE_ICON[file.language]}
                size="sm"
                color={isActive ? 'primary' : 'secondary'}
              />
              <Text
                type="body"
                color="inherit"
                weight={isActive ? 'semibold' : 'normal'}>
                {name}
              </Text>
              {file.isDirty && (
                <span
                  style={styles.dirtyDot}
                  role="img"
                  aria-label="Unsaved changes"
                  title="Unsaved changes"
                />
              )}
            </button>
            <IconButton
              label={`Close ${name}`}
              tooltip="Close"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => closeTab(fileId)}
            />
          </div>
        );
      })}
    </div>
  );

  // ---- Code viewport ----

  const codeViewport =
    activeFile !== null && cursor !== null ? (
      <div style={styles.viewport}>
        <div style={styles.codeScroller}>
          {activeFile.lines.map((_, index) => (
            <CodeLine
              key={index}
              file={activeFile}
              lineIndex={index}
              isActive={cursor.line === index + 1}
              onSelect={() => placeCursor(activeFile.id, index + 1, 1)}
            />
          ))}
        </div>
        {!isNarrow && <Minimap file={activeFile} cursorLine={cursor.line} />}
      </div>
    ) : (
      <div style={styles.emptyEditorFill}>
        <EmptyState
          icon={<Icon icon={FilesIcon} size="lg" />}
          title="No editors open"
          description="Pick a file from the explorer, or jump straight to a diagnostic from the problems panel below."
          actions={
            <Button
              label="Open README.md"
              variant="secondary"
              onClick={() => openFile('file-readme')}
            />
          }
        />
      </div>
    );

  // ---- Problems panel ----

  const problemsPanel = (
    <div style={styles.problems}>
      <button
        type="button"
        style={styles.problemsHeader}
        aria-expanded={isProblemsOpen}
        aria-controls="problems-panel"
        onClick={() => setIsProblemsOpen(open => !open)}>
        <Icon
          icon={isProblemsOpen ? ChevronDownIcon : ChevronUpIcon}
          size="sm"
          color="secondary"
        />
        <Text type="label">Problems</Text>
        <Badge variant="error" label={String(ERROR_COUNT)} />
        <Badge variant="warning" label={String(WARNING_COUNT)} />
        <StackItem size="fill" />
        <Text type="supporting" color="secondary">
          {isProblemsOpen ? 'Collapse' : 'Expand'}
        </Text>
      </button>
      {isProblemsOpen && (
        <div id="problems-panel" style={styles.problemsList}>
          <List density="compact" hasDividers={false}>
            {PROBLEMS.map(problem => {
              const file = FILES[problem.fileId];
              return (
                <ListItem
                  key={problem.id}
                  label={problem.message}
                  description={
                    <HStack gap={1} vAlign="center" wrap="wrap">
                      <Text type="supporting" color="secondary" maxLines={1}>
                        {file.path}
                      </Text>
                      <Text
                        type="supporting"
                        color="secondary"
                        hasTabularNumbers>
                        [Ln {problem.line}, Col {problem.col}]
                      </Text>
                      <Text type="supporting" color="secondary">
                        {problem.source}
                      </Text>
                    </HStack>
                  }
                  startContent={
                    <span
                      style={{
                        ...styles.severityIcon,
                        color: severityColor(problem.severity),
                      }}>
                      <Icon
                        icon={
                          problem.severity === 'error'
                            ? CircleXIcon
                            : TriangleAlertIcon
                        }
                        size="sm"
                        color="inherit"
                      />
                    </span>
                  }
                  onClick={() => jumpToProblem(problem)}
                />
              );
            })}
          </List>
        </div>
      )}
    </div>
  );

  // ---- Editor column (tabs + viewport + problems) ----

  const editorPane = (
    <div style={styles.editorColumn}>
      {tabStrip}
      {codeViewport}
      {problemsPanel}
    </div>
  );

  // ---- Header ----

  const headerTitle = (
    <HStack gap={2} vAlign="center">
      <Heading level={1}>Orbit Studio</Heading>
      <Text type="supporting" color="secondary">
        {WORKSPACE} — local workspace
      </Text>
    </HStack>
  );

  const mobilePaneSwitch = (
    <SegmentedControl
      label="Workspace pane"
      value={mobileView}
      onChange={value => setMobileView(value as MobileView)}>
      <SegmentedControlItem value="explorer" label="Explorer" />
      <SegmentedControlItem value="editor" label="Editor" />
    </SegmentedControl>
  );

  // ---- Status bar ----

  const statusBar = (
    <div style={styles.statusBar}>
      <span style={styles.statusGroup}>
        <Icon icon={GitBranchIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary" maxLines={1}>
          {BRANCH}
        </Text>
      </span>
      <button
        type="button"
        style={styles.statusButton}
        aria-expanded={isProblemsOpen}
        aria-controls="problems-panel"
        aria-label={`${ERROR_COUNT} errors, ${WARNING_COUNT} warnings — toggle problems panel`}
        onClick={() => setIsProblemsOpen(open => !open)}>
        <span
          style={{...styles.severityIcon, color: 'var(--color-error)'}}>
          <Icon icon={CircleXIcon} size="xsm" color="inherit" />
        </span>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {ERROR_COUNT}
        </Text>
        <span
          style={{...styles.severityIcon, color: 'var(--color-warning)'}}>
          <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
        </span>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {WARNING_COUNT}
        </Text>
      </button>
      <span style={styles.statusSpacer} />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {cursor !== null ? `Ln ${cursor.line}, Col ${cursor.col}` : '—'}
      </Text>
      <Text type="supporting" color="secondary">
        {activeFile !== null ? LANGUAGE_LABEL[activeFile.language] : '—'}
      </Text>
      {!isNarrow && (
        <>
          <Text type="supporting" color="secondary">
            UTF-8
          </Text>
          <Text type="supporting" color="secondary">
            LF
          </Text>
          <Text type="supporting" color="secondary">
            Spaces: 2
          </Text>
        </>
      )}
    </div>
  );

  const mainContent = isNarrow
    ? mobileView === 'explorer'
      ? explorerPane
      : editorPane
    : editorPane;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {isNarrow ? (
            // The pane switch drops to its own row so both segments stay
            // full-height tap targets at 375px instead of clipping.
            <VStack gap={2}>
              {headerTitle}
              {mobilePaneSwitch}
            </VStack>
          ) : (
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">{headerTitle}</StackItem>
              <Button
                label="Run"
                variant="ghost"
                size="sm"
                icon={<Icon icon={PlayIcon} size="sm" />}
                onClick={() => {}}
              />
              <IconButton
                label="Workspace settings"
                tooltip="Settings"
                icon={<Icon icon={SettingsIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => {}}
              />
            </HStack>
          )}
        </LayoutHeader>
      }
      start={
        !isNarrow ? (
          <LayoutPanel width={260} padding={0} label="File explorer">
            {explorerPane}
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {mainContent}
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider padding={0} label="Status bar">
          {statusBar}
        </LayoutFooter>
      }
    />
  );
}
