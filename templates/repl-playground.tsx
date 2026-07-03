// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (three tokenized TypeScript snippets —
 *   a groupBy utility that prints logs, a cart pricer that emits a
 *   console.table value, and a JSON.parse failure that throws with a
 *   stack — each with pre-captured console entries, fixed millisecond
 *   durations, frozen HH:MM:SS.mmm entry times, and fake share slugs)
 * @output Interactive REPL playground: left, a dark editor pane with a
 *   line-number gutter and syntax-toned spans rendered straight from
 *   fixture token data (no real highlighter), topped by an examples
 *   Selector plus Copy source / Share link actions; right, a docked
 *   console panel whose Run button reveals the matching fixture output —
 *   plain log/info/warn lines, a console.table grid, or a red error with
 *   a collapsible stack — behind All / Logs / Errors filter tabs with
 *   live count badges, an execution-time badge, an exit-status badge, a
 *   clear-console action, and a run-provenance footer.
 * @position Page template; emitted by `astryx template repl-playground`
 *
 * Frame: Layout height="fill". LayoutHeader carries the playground title,
 * runtime badge, and the primary Run button (plus the Editor/Console
 * SegmentedControl in single-pane mode). LayoutContent owns the editor
 * column (toolbar row, scrolling code body, status footer); the console
 * lives in a fixed-width LayoutPanel on the end side (header row, filter
 * tabs, scrolling dark output body, provenance footer).
 *
 * Responsive contract:
 * - >1100px: console panel is 420px; the editor fills the rest.
 * - <=1100px: console panel narrows to 360px; the editor keeps fill.
 * - <=640px: single-pane mode — the end panel unmounts and an
 *   Editor/Console SegmentedControl in the header swaps the two columns;
 *   pressing Run jumps straight to the console view so the revealed
 *   output is never off-screen. The header sheds the runtime badge, the
 *   title truncates to one line, and the Run button keeps its label. The
 *   editor toolbar's Copy/Share buttons collapse to 40px icon buttons,
 *   the examples Selector and Run button grow to ~40px tap targets, the
 *   filter tabs get a 40px hit area via the local size token, and the
 *   error stack toggle grows to a >=40px target. Nothing is hover-only:
 *   every reveal (output, stack, filters) is click/tap driven, and both
 *   scroll regions are keyboard-focusable.
 * - Usable at 375px: header cells truncate before actions clip, the
 *   editor toolbar wraps onto a second row instead of overflowing, and
 *   code lines / the console.table grid scroll horizontally inside their
 *   dark bodies (whiteSpace pre + overflowX auto) rather than widening
 *   the page.
 * - Editor body and console body scroll independently; page chrome,
 *   toolbars, tabs, and footers stay pinned.
 *
 * Container policy (playground archetype): two primary containers only —
 * the dark editor body and the dark console body, both on a fixed
 * terminal palette that stays dark in either theme (they reproduce a code
 * surface, so they never use themed Text colors). All chrome around them
 * (toolbars, tabs, footers) is plain frame rows, not Cards.
 *
 * Color policy: the editor body and console body are deliberately
 * scheme-locked terminal-dark surfaces — they keep the raw CODE hex
 * palette and set `colorScheme: 'dark'` inline so scrollbars and any
 * light-dark() tokens inside resolve dark in both themes. Everything
 * rendered on those surfaces (gutter, syntax spans, console entries,
 * table grid, error block, hint) uses CODE literals, never themed
 * tokens, so it stays readable regardless of the page scheme. All
 * chrome outside the two dark bodies uses only themed components and
 * tokens, so it follows light/dark automatically.
 *
 * Fixture policy: fixed data only — no Date.now, no Math.random, no
 * network assets. Entry timestamps are frozen strings, durations are
 * per-example constants, run numbers advance deterministically from
 * seeded counters, and share URLs are obviously fake slugs.
 */

import {useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  Stack,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CopyIcon,
  PlayIcon,
  Share2Icon,
  TerminalIcon,
  Trash2Icon,
} from 'lucide-react';

// ============= CODE PALETTE =============
// The editor and console reproduce a code surface, so they keep a fixed
// dark palette instead of themed Text colors (dark in both themes).
// Scheme-locked on purpose: these literals stay raw hex — do NOT swap
// them for theme tokens. The surfaces that use them declare
// `colorScheme: 'dark'` (see editorBody / consoleBody below).

const CODE = {
  bg: '#0d1117',
  bgSubtle: '#161b22',
  border: '#22272e',
  base: '#c9d1d9',
  dim: '#768390',
  gutter: '#484f58',
  keyword: '#ff7b72',
  string: '#a5d6ff',
  number: '#79c0ff',
  comment: '#8b949e',
  fn: '#d2a8ff',
  type: '#ffa657',
  prop: '#7ee787',
  info: '#79c0ff',
  warn: '#d4a72c',
  error: '#f47067',
  green: '#3fb950',
} as const;

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Editor / console columns fill their region; bodies scroll inside.
  column: {height: '100%', minHeight: 0},
  columnFill: {flex: 1, minHeight: 0},
  // Toolbar above the editor: wraps onto a second row before clipping.
  toolbar: {
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-2)',
  },
  // The Selector cell gives way (truncates) before the actions clip.
  toolbarSelector: {minWidth: 0},
  // Dark editor body: mono, scrolls both axes, lines never wrap.
  // Scheme-locked terminal surface (see Color policy in the header).
  editorBody: {
    minHeight: 0,
    overflow: 'auto',
    colorScheme: 'dark',
    backgroundColor: CODE.bg,
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    lineHeight: 1.7,
    color: CODE.base,
    paddingBlock: 'var(--spacing-3)',
  },
  editorLines: {minWidth: 'max-content'},
  editorLine: {
    display: 'flex',
    paddingInline: 'var(--spacing-3)',
  },
  // Line-number gutter: fixed width, right-aligned, never selectable.
  gutterCell: {
    flex: 'none',
    width: 34,
    textAlign: 'right',
    marginRight: 'var(--spacing-3)',
    color: CODE.gutter,
    userSelect: 'none',
  },
  codeCell: {whiteSpace: 'pre'},
  // Editor / console status footers.
  statusRow: {
    alignItems: 'center',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-2)',
  },
  // Console chrome rows sit on the themed background above the dark body.
  consoleHeader: {
    alignItems: 'center',
    paddingInline: 'var(--spacing-4)',
    paddingTop: 'var(--spacing-3)',
    paddingBottom: 'var(--spacing-1)',
  },
  consoleTabs: {paddingInline: 'var(--spacing-2)'},
  // Dark console body: mono output stream, scrolls independently.
  // Scheme-locked terminal surface (see Color policy in the header).
  consoleBody: {
    minHeight: 0,
    overflow: 'auto',
    colorScheme: 'dark',
    backgroundColor: CODE.bg,
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    lineHeight: 1.7,
    color: CODE.base,
    padding: 'var(--spacing-3)',
  },
  consoleEntry: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    paddingBlock: 2,
  },
  entryTime: {
    flex: 'none',
    color: CODE.gutter,
    userSelect: 'none',
  },
  entryText: {whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'},
  // console.table rendering: bordered mono grid, scrolls in x.
  tableScroll: {overflowX: 'auto', paddingBlock: 'var(--spacing-1)'},
  tableGrid: {
    borderCollapse: 'collapse',
    fontFamily: MONO_FONT,
    fontSize: 12.5,
  },
  tableHeadCell: {
    border: `1px solid ${CODE.border}`,
    padding: '2px 10px',
    color: CODE.dim,
    fontWeight: 400,
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  tableCell: {
    border: `1px solid ${CODE.border}`,
    padding: '2px 10px',
    whiteSpace: 'nowrap',
  },
  tableNumCell: {
    border: `1px solid ${CODE.border}`,
    padding: '2px 10px',
    whiteSpace: 'nowrap',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
  // Error block: red name/message with an indented, collapsible stack.
  errorBlock: {
    border: `1px solid ${CODE.border}`,
    borderLeft: `3px solid ${CODE.error}`,
    borderRadius: 4,
    backgroundColor: CODE.bgSubtle,
    padding: 'var(--spacing-2) var(--spacing-3)',
    marginBlock: 'var(--spacing-1)',
  },
  stackLine: {
    whiteSpace: 'pre',
    color: CODE.dim,
    paddingLeft: 'var(--spacing-4)',
  },
  // Unstyled native button for the stack toggle: mono, dim, real focus.
  stackToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: 0,
    border: 'none',
    background: 'transparent',
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    color: CODE.dim,
    cursor: 'pointer',
    minHeight: 28,
  },
  stackToggleCompact: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: 0,
    border: 'none',
    background: 'transparent',
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    color: CODE.dim,
    cursor: 'pointer',
    minHeight: 40,
  },
  // Idle console hint (before the first Run of an example).
  consoleHint: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-6) var(--spacing-4)',
    color: CODE.dim,
    textAlign: 'center',
  },
  filteredEmpty: {color: CODE.dim, paddingBlock: 'var(--spacing-2)'},
  // The header title cell gives way first so actions never clip.
  headerTitle: {minWidth: 0},
  // ~40px touch targets in single-pane mode (size="sm" renders 28px).
  buttonTapTarget: {height: 40},
  iconTapTarget: {width: 40, height: 40},
  selectorTapTarget: {height: 40},
  // SegmentedControlItem / Tab heights derive from --size-element-sm;
  // raising the token locally gives them a 40px hit area on mobile.
  segmentedTapTarget: {'--size-element-sm': '40px'} as CSSProperties,
  tabsTapTarget: {'--size-element-sm': '40px'} as CSSProperties,
};

// ============= DATA =============
// Deterministic fixtures: tokenized source (no real highlighter), frozen
// console entries, fixed durations, and obviously fake share slugs.

const RUNTIME_LABEL = 'quickjs 0.9.0 · sandbox';

/** Syntax tone for one editor span — colors come from the CODE palette. */
type TokenTone =
  | 'kw' // keyword
  | 'str' // string / template literal
  | 'num' // numeric literal
  | 'com' // comment
  | 'fn' // function / method name
  | 'typ' // type name
  | 'prp' // property key
  | 'pln'; // plain text / punctuation

const TONE_COLORS: Record<TokenTone, string> = {
  kw: CODE.keyword,
  str: CODE.string,
  num: CODE.number,
  com: CODE.comment,
  fn: CODE.fn,
  typ: CODE.type,
  prp: CODE.prop,
  pln: CODE.base,
};

/** One syntax-toned span: [tone, text]. A line is a span list. */
type EditorSpan = [TokenTone, string];
type EditorLine = EditorSpan[];

type LogLevel = 'log' | 'info' | 'warn';

/** One captured console entry — a log line, a table value, or an error. */
type ConsoleEntry =
  | {id: string; kind: 'log'; level: LogLevel; time: string; text: string}
  | {
      id: string;
      kind: 'table';
      time: string;
      columns: string[];
      /** Row cells, aligned to `columns`; numeric flags right-align. */
      rows: string[][];
      numericColumns: number[];
    }
  | {
      id: string;
      kind: 'error';
      time: string;
      name: string;
      message: string;
      stack: string[];
    };

type ExampleId = 'group-tickets' | 'price-cart' | 'parse-limits';

interface Example {
  id: ExampleId;
  file: string;
  /** Selector option label — names the snippet and its output shape. */
  label: string;
  lines: EditorLine[];
  entries: ConsoleEntry[];
  /** Fixed wall-clock duration of the captured run. */
  duration: string;
  exit: {label: string; variant: 'success' | 'error'};
  /** Obviously fake share slug (no real host). */
  shareUrl: string;
}

// --- Example 1: groupBy utility → plain log/info/warn output ---

const GROUP_TICKETS_LINES: EditorLine[] = [
  [['com', '// Group release tickets by owning team.']],
  [
    ['kw', 'type '],
    ['typ', 'Ticket'],
    ['pln', ' = {'],
    ['prp', 'id'],
    ['pln', ': '],
    ['typ', 'string'],
    ['pln', '; '],
    ['prp', 'team'],
    ['pln', ': '],
    ['typ', 'string'],
    ['pln', '; '],
    ['prp', 'title'],
    ['pln', ': '],
    ['typ', 'string'],
    ['pln', '};'],
  ],
  [],
  [
    ['kw', 'const '],
    ['pln', 'tickets: '],
    ['typ', 'Ticket'],
    ['pln', '[] = ['],
  ],
  [
    ['pln', '  {'],
    ['prp', 'id'],
    ['pln', ': '],
    ['str', "'REL-201'"],
    ['pln', ', '],
    ['prp', 'team'],
    ['pln', ': '],
    ['str', "'platform'"],
    ['pln', ', '],
    ['prp', 'title'],
    ['pln', ': '],
    ['str', "'Rotate signing keys'"],
    ['pln', '},'],
  ],
  [
    ['pln', '  {'],
    ['prp', 'id'],
    ['pln', ': '],
    ['str', "'REL-202'"],
    ['pln', ', '],
    ['prp', 'team'],
    ['pln', ': '],
    ['str', "'mobile'"],
    ['pln', ', '],
    ['prp', 'title'],
    ['pln', ': '],
    ['str', "'Ship 6.4 to beta'"],
    ['pln', '},'],
  ],
  [
    ['pln', '  {'],
    ['prp', 'id'],
    ['pln', ': '],
    ['str', "'REL-203'"],
    ['pln', ', '],
    ['prp', 'team'],
    ['pln', ': '],
    ['str', "'platform'"],
    ['pln', ', '],
    ['prp', 'title'],
    ['pln', ': '],
    ['str', "'Bump node to 24'"],
    ['pln', '},'],
  ],
  [['pln', '];']],
  [],
  [
    ['kw', 'function '],
    ['fn', 'groupBy'],
    ['pln', '<'],
    ['typ', 'T'],
    ['pln', '>(items: '],
    ['typ', 'T'],
    ['pln', '[], key: (item: '],
    ['typ', 'T'],
    ['pln', ') => '],
    ['typ', 'string'],
    ['pln', ') {'],
  ],
  [
    ['pln', '  '],
    ['kw', 'const '],
    ['pln', 'out: '],
    ['typ', 'Record'],
    ['pln', '<'],
    ['typ', 'string'],
    ['pln', ', '],
    ['typ', 'T'],
    ['pln', '[]> = {};'],
  ],
  [
    ['pln', '  '],
    ['kw', 'for '],
    ['pln', '('],
    ['kw', 'const '],
    ['pln', 'item '],
    ['kw', 'of '],
    ['pln', 'items) {'],
  ],
  [
    ['pln', '    (out[key(item)] '],
    ['kw', '??= '],
    ['pln', '[]).'],
    ['fn', 'push'],
    ['pln', '(item);'],
  ],
  [['pln', '  }']],
  [
    ['pln', '  '],
    ['kw', 'return '],
    ['pln', 'out;'],
  ],
  [['pln', '}']],
  [],
  [
    ['kw', 'const '],
    ['pln', 'byTeam = '],
    ['fn', 'groupBy'],
    ['pln', '(tickets, t => t.'],
    ['prp', 'team'],
    ['pln', ');'],
  ],
  [
    ['pln', 'console.'],
    ['fn', 'info'],
    ['pln', '('],
    ['str', '`teams: ${'],
    ['pln', 'Object.'],
    ['fn', 'keys'],
    ['pln', '(byTeam).length'],
    ['str', '}`'],
    ['pln', ');'],
  ],
  [
    ['kw', 'for '],
    ['pln', '('],
    ['kw', 'const '],
    ['pln', '[team, rows] '],
    ['kw', 'of '],
    ['pln', 'Object.'],
    ['fn', 'entries'],
    ['pln', '(byTeam)) {'],
  ],
  [
    ['pln', '  console.'],
    ['fn', 'log'],
    ['pln', '('],
    ['str', '`${'],
    ['pln', 'team'],
    ['str', '} -> ${'],
    ['pln', 'rows.length'],
    ['str', '} ticket(s)`'],
    ['pln', ');'],
  ],
  [['pln', '}']],
  [
    ['pln', 'console.'],
    ['fn', 'warn'],
    ['pln', '('],
    ['str', "'mobile is below the 2-ticket staffing bar'"],
    ['pln', ');'],
  ],
];

// --- Example 2: cart pricing → console.table value ---

const PRICE_CART_LINES: EditorLine[] = [
  [['com', '// Price the cart and inspect line items with console.table.']],
  [
    ['kw', 'const '],
    ['pln', 'TAX_RATES = {'],
    ['prp', 'standard'],
    ['pln', ': '],
    ['num', '0.0825'],
    ['pln', ', '],
    ['prp', 'reduced'],
    ['pln', ': '],
    ['num', '0.02'],
    ['pln', '} '],
    ['kw', 'as const'],
    ['pln', ';'],
  ],
  [],
  [
    ['kw', 'const '],
    ['pln', 'cart = ['],
  ],
  [
    ['pln', '  {'],
    ['prp', 'sku'],
    ['pln', ': '],
    ['str', "'MUG-11'"],
    ['pln', ', '],
    ['prp', 'qty'],
    ['pln', ': '],
    ['num', '2'],
    ['pln', ', '],
    ['prp', 'unit'],
    ['pln', ': '],
    ['num', '14.0'],
    ['pln', ', '],
    ['prp', 'band'],
    ['pln', ': '],
    ['str', "'standard'"],
    ['pln', '},'],
  ],
  [
    ['pln', '  {'],
    ['prp', 'sku'],
    ['pln', ': '],
    ['str', "'TEE-04'"],
    ['pln', ', '],
    ['prp', 'qty'],
    ['pln', ': '],
    ['num', '1'],
    ['pln', ', '],
    ['prp', 'unit'],
    ['pln', ': '],
    ['num', '28.5'],
    ['pln', ', '],
    ['prp', 'band'],
    ['pln', ': '],
    ['str', "'standard'"],
    ['pln', '},'],
  ],
  [
    ['pln', '  {'],
    ['prp', 'sku'],
    ['pln', ': '],
    ['str', "'BOOK-7'"],
    ['pln', ', '],
    ['prp', 'qty'],
    ['pln', ': '],
    ['num', '3'],
    ['pln', ', '],
    ['prp', 'unit'],
    ['pln', ': '],
    ['num', '12.0'],
    ['pln', ', '],
    ['prp', 'band'],
    ['pln', ': '],
    ['str', "'reduced'"],
    ['pln', '},'],
  ],
  [
    ['pln', '] '],
    ['kw', 'as const'],
    ['pln', ';'],
  ],
  [],
  [
    ['kw', 'const '],
    ['pln', 'lines = cart.'],
    ['fn', 'map'],
    ['pln', '(item => {'],
  ],
  [
    ['pln', '  '],
    ['kw', 'const '],
    ['pln', 'net = item.'],
    ['prp', 'qty'],
    ['pln', ' * item.'],
    ['prp', 'unit'],
    ['pln', ';'],
  ],
  [
    ['pln', '  '],
    ['kw', 'const '],
    ['pln', 'tax = +(net * TAX_RATES[item.'],
    ['prp', 'band'],
    ['pln', ']).'],
    ['fn', 'toFixed'],
    ['pln', '('],
    ['num', '2'],
    ['pln', ');'],
  ],
  [
    ['pln', '  '],
    ['kw', 'return '],
    ['pln', '{'],
    ['prp', 'sku'],
    ['pln', ': item.'],
    ['prp', 'sku'],
    ['pln', ', '],
    ['prp', 'qty'],
    ['pln', ': item.'],
    ['prp', 'qty'],
    ['pln', ', net, tax};'],
  ],
  [['pln', '});']],
  [],
  [
    ['pln', 'console.'],
    ['fn', 'table'],
    ['pln', '(lines);'],
  ],
  [
    ['kw', 'const '],
    ['pln', 'total = lines.'],
    ['fn', 'reduce'],
    ['pln', '((sum, row) => sum + row.'],
    ['prp', 'net'],
    ['pln', ' + row.'],
    ['prp', 'tax'],
    ['pln', ', '],
    ['num', '0'],
    ['pln', ');'],
  ],
  [
    ['pln', 'console.'],
    ['fn', 'log'],
    ['pln', '('],
    ['str', '`order total: $${'],
    ['pln', 'total.'],
    ['fn', 'toFixed'],
    ['pln', '('],
    ['num', '2'],
    ['pln', ')'],
    ['str', '}`'],
    ['pln', ');'],
  ],
];

// --- Example 3: config parse → thrown SyntaxError with stack ---

const PARSE_LIMITS_LINES: EditorLine[] = [
  [['com', '// Load deploy limits from an env-provided JSON blob.']],
  [
    ['kw', 'const '],
    ['pln', 'raw = process.env.'],
    ['prp', 'DEPLOY_LIMITS'],
    ['pln', ' '],
    ['kw', '?? '],
    ['str', "'{maxPods: 40}'"],
    ['pln', ';'],
  ],
  [],
  [
    ['kw', 'function '],
    ['fn', 'parseLimits'],
    ['pln', '(input: '],
    ['typ', 'string'],
    ['pln', ') {'],
  ],
  [
    ['pln', '  '],
    ['kw', 'const '],
    ['pln', 'parsed = JSON.'],
    ['fn', 'parse'],
    ['pln', '(input);'],
  ],
  [
    ['pln', '  '],
    ['kw', 'return '],
    ['pln', '{'],
    ['prp', 'maxPods'],
    ['pln', ': '],
    ['fn', 'Number'],
    ['pln', '(parsed.'],
    ['prp', 'maxPods'],
    ['pln', ')};'],
  ],
  [['pln', '}']],
  [],
  [
    ['pln', 'console.'],
    ['fn', 'log'],
    ['pln', '('],
    ['str', "'parsing deploy limits...'"],
    ['pln', ');'],
  ],
  [
    ['kw', 'const '],
    ['pln', 'limits = '],
    ['fn', 'parseLimits'],
    ['pln', '(raw);'],
  ],
  [
    ['pln', 'console.'],
    ['fn', 'log'],
    ['pln', '('],
    ['str', '`maxPods = ${'],
    ['pln', 'limits.'],
    ['prp', 'maxPods'],
    ['str', '}`'],
    ['pln', ');'],
  ],
];

const EXAMPLES: Example[] = [
  {
    id: 'group-tickets',
    file: 'group-tickets.ts',
    label: 'group-tickets.ts — console logs',
    lines: GROUP_TICKETS_LINES,
    duration: '4 ms',
    exit: {label: 'exit 0', variant: 'success'},
    shareUrl: 'play.example.test/s/grp-tix-01',
    entries: [
      {
        id: 'gt-1',
        kind: 'log',
        level: 'info',
        time: '14:02:07.101',
        text: 'teams: 2',
      },
      {
        id: 'gt-2',
        kind: 'log',
        level: 'log',
        time: '14:02:07.102',
        text: 'platform -> 2 ticket(s)',
      },
      {
        id: 'gt-3',
        kind: 'log',
        level: 'log',
        time: '14:02:07.102',
        text: 'mobile -> 1 ticket(s)',
      },
      {
        id: 'gt-4',
        kind: 'log',
        level: 'warn',
        time: '14:02:07.103',
        text: 'mobile is below the 2-ticket staffing bar',
      },
    ],
  },
  {
    id: 'price-cart',
    file: 'price-cart.ts',
    label: 'price-cart.ts — console.table',
    lines: PRICE_CART_LINES,
    duration: '11 ms',
    exit: {label: 'exit 0', variant: 'success'},
    shareUrl: 'play.example.test/s/cart-prc-02',
    entries: [
      {
        id: 'pc-1',
        kind: 'table',
        time: '14:05:31.240',
        columns: ['(index)', 'sku', 'qty', 'net', 'tax'],
        numericColumns: [2, 3, 4],
        rows: [
          ['0', "'MUG-11'", '2', '28', '2.31'],
          ['1', "'TEE-04'", '1', '28.5', '2.35'],
          ['2', "'BOOK-7'", '3', '36', '0.72'],
        ],
      },
      {
        id: 'pc-2',
        kind: 'log',
        level: 'log',
        time: '14:05:31.244',
        text: 'order total: $97.88',
      },
    ],
  },
  {
    id: 'parse-limits',
    file: 'parse-limits.ts',
    label: 'parse-limits.ts — thrown error',
    lines: PARSE_LIMITS_LINES,
    duration: '2 ms',
    exit: {label: 'exit 1', variant: 'error'},
    shareUrl: 'play.example.test/s/lim-err-03',
    entries: [
      {
        id: 'pl-1',
        kind: 'log',
        level: 'log',
        time: '14:09:12.310',
        text: 'parsing deploy limits...',
      },
      {
        id: 'pl-2',
        kind: 'error',
        time: '14:09:12.311',
        name: 'SyntaxError',
        message:
          'Unexpected token \'m\', "{maxPods: 40}" is not valid JSON',
        stack: [
          'at JSON.parse (<anonymous>)',
          'at parseLimits (parse-limits.ts:5:23)',
          'at <main> (parse-limits.ts:10:16)',
        ],
      },
    ],
  },
];

// Seeded run counters keep provenance numbers deterministic across runs.
const RUN_SEEDS: Record<ExampleId, number> = {
  'group-tickets': 3,
  'price-cart': 1,
  'parse-limits': 6,
};

type ConsoleFilter = 'all' | 'logs' | 'errors';

const LEVEL_PREFIX: Record<LogLevel, {glyph: string; color: string}> = {
  log: {glyph: '›', color: CODE.dim},
  info: {glyph: 'ℹ', color: CODE.info},
  warn: {glyph: '▲', color: CODE.warn},
};

/** Plain source text for an example, derived from its token spans. */
function sourceOf(example: Example): string {
  return example.lines
    .map(line => line.map(([, text]) => text).join(''))
    .join('\n');
}

function isErrorEntry(entry: ConsoleEntry): boolean {
  return entry.kind === 'error';
}

// ============= EDITOR PANE =============

/**
 * Dark editor body: line-number gutter plus syntax-toned spans rendered
 * straight from fixture token data. Lines never wrap — the body scrolls
 * horizontally — and the region is keyboard-focusable so the scrollback
 * works without a pointer.
 */
function EditorPane({example}: {example: Example}) {
  return (
    <div
      role="region"
      aria-label={`${example.file} source`}
      tabIndex={0}
      style={styles.editorBody}>
      <div style={styles.editorLines}>
        {example.lines.map((line, index) => (
          <div key={`${example.id}-line-${index + 1}`} style={styles.editorLine}>
            <span style={styles.gutterCell} aria-hidden>
              {index + 1}
            </span>
            <span style={styles.codeCell}>
              {line.length === 0
                ? ' '
                : line.map(([tone, text], spanIndex) => (
                    <span
                      key={spanIndex}
                      style={{color: TONE_COLORS[tone]}}>
                      {text}
                    </span>
                  ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= CONSOLE ENTRIES =============

function LogEntryRow({
  entry,
}: {
  entry: Extract<ConsoleEntry, {kind: 'log'}>;
}) {
  const prefix = LEVEL_PREFIX[entry.level];
  const textColor =
    entry.level === 'warn' ? CODE.warn : entry.level === 'info' ? CODE.info : CODE.base;
  return (
    <div style={styles.consoleEntry}>
      <span style={styles.entryTime} aria-hidden>
        {entry.time}
      </span>
      <span style={{...styles.entryText, color: textColor}}>
        <span style={{color: prefix.color}}>{prefix.glyph} </span>
        {entry.text}
      </span>
    </div>
  );
}

/** console.table value: a bordered mono grid that scrolls in x. */
function TableEntryRow({
  entry,
}: {
  entry: Extract<ConsoleEntry, {kind: 'table'}>;
}) {
  return (
    <div style={styles.consoleEntry}>
      <span style={styles.entryTime} aria-hidden>
        {entry.time}
      </span>
      <div style={styles.tableScroll}>
        <table style={styles.tableGrid}>
          <thead>
            <tr>
              {entry.columns.map(column => (
                <th key={column} scope="col" style={styles.tableHeadCell}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entry.rows.map((row, rowIndex) => (
              <tr key={`${entry.id}-row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${entry.id}-cell-${rowIndex}-${cellIndex}`}
                    style={
                      entry.numericColumns.includes(cellIndex)
                        ? styles.tableNumCell
                        : styles.tableCell
                    }>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Thrown-error entry: red name + message with a collapsible stack. The
 * toggle is a real button (aria-expanded, >=40px on touch layouts) — no
 * hover-only affordances.
 */
function ErrorEntryRow({
  entry,
  isStackOpen,
  isCompact,
  onToggleStack,
}: {
  entry: Extract<ConsoleEntry, {kind: 'error'}>;
  isStackOpen: boolean;
  isCompact: boolean;
  onToggleStack: () => void;
}) {
  return (
    <div style={styles.consoleEntry}>
      <span style={styles.entryTime} aria-hidden>
        {entry.time}
      </span>
      <div style={{...styles.errorBlock, flex: 1, minWidth: 0}}>
        <div style={{...styles.entryText, color: CODE.error}}>
          <span aria-hidden>✖ </span>
          {entry.name}: {entry.message}
        </div>
        {isStackOpen &&
          entry.stack.map(frame => (
            <div key={frame} style={styles.stackLine}>
              {frame}
            </div>
          ))}
        <button
          type="button"
          aria-expanded={isStackOpen}
          style={isCompact ? styles.stackToggleCompact : styles.stackToggle}
          onClick={onToggleStack}>
          {isStackOpen
            ? '▾ hide stack'
            : `▸ show stack (${entry.stack.length} frames)`}
        </button>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function ReplPlaygroundTemplate() {
  const [exampleId, setExampleId] = useState<ExampleId>('group-tickets');
  // Which examples have been Run — output stays hidden until then.
  const [hasRun, setHasRun] = useState<Record<ExampleId, boolean>>({
    'group-tickets': false,
    'price-cart': false,
    'parse-limits': false,
  });
  // Deterministic run numbers: seeded per example, bumped by each Run.
  const [runNumbers, setRunNumbers] = useState<Record<ExampleId, number>>(
    RUN_SEEDS,
  );
  const [filter, setFilter] = useState<ConsoleFilter>('all');
  const [copiedId, setCopiedId] = useState<ExampleId | null>(null);
  const [sharedId, setSharedId] = useState<ExampleId | null>(null);
  // Error stacks start expanded (devtools-style); toggles collapse them.
  const [closedStacks, setClosedStacks] = useState<Record<string, boolean>>(
    {},
  );
  // Single-pane mode below 640px: one surface at a time.
  const [mobileView, setMobileView] = useState('editor');

  const isSinglePane = useMediaQuery('(max-width: 640px)');
  const isPanelNarrow = useMediaQuery('(max-width: 1100px)');

  const example =
    EXAMPLES.find(item => item.id === exampleId) ?? EXAMPLES[0];
  const isRun = hasRun[example.id];

  // Revealed entries: nothing until Run, then the captured fixture output.
  const revealed = isRun ? example.entries : [];
  const logCount = revealed.filter(entry => !isErrorEntry(entry)).length;
  const errorCount = revealed.filter(isErrorEntry).length;
  const visible =
    filter === 'logs'
      ? revealed.filter(entry => !isErrorEntry(entry))
      : filter === 'errors'
        ? revealed.filter(isErrorEntry)
        : revealed;

  // Grow the sm controls to ~40px touch targets in single-pane mode.
  const tapTargetStyle = isSinglePane ? styles.buttonTapTarget : undefined;

  const selectExample = (id: string) => {
    setExampleId(id as ExampleId);
    setCopiedId(null);
    setSharedId(null);
  };

  const runExample = () => {
    setHasRun(prev => ({...prev, [example.id]: true}));
    setRunNumbers(prev => ({...prev, [example.id]: prev[example.id] + 1}));
    // In single-pane mode, jump to the console so the output is visible.
    if (isSinglePane) {
      setMobileView('console');
    }
  };

  const clearConsole = () => {
    setHasRun(prev => ({...prev, [example.id]: false}));
  };

  const copySource = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard != null) {
      void navigator.clipboard.writeText(sourceOf(example));
    }
    setCopiedId(example.id);
  };

  const shareLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard != null) {
      void navigator.clipboard.writeText(`https://${example.shareUrl}`);
    }
    setSharedId(example.id);
  };

  const toggleStack = (entryId: string) => {
    setClosedStacks(prev => ({...prev, [entryId]: !prev[entryId]}));
  };

  const isCopied = copiedId === example.id;
  const isShared = sharedId === example.id;

  // ---- Editor column: toolbar / dark code body / status footer ----

  const editorColumn = (
    <Stack direction="vertical" style={styles.column}>
      <HStack gap={2} style={styles.toolbar}>
        <StackItem size="fill" style={styles.toolbarSelector}>
          <Selector
            label="Example snippet"
            isLabelHidden
            size="sm"
            options={EXAMPLES.map(item => ({
              value: item.id,
              label: item.label,
            }))}
            value={example.id}
            onChange={selectExample}
            style={isSinglePane ? styles.selectorTapTarget : undefined}
          />
        </StackItem>
        {isSinglePane ? (
          <>
            <IconButton
              label={isCopied ? 'Source copied' : 'Copy source'}
              tooltip={isCopied ? 'Source copied' : 'Copy source'}
              icon={<Icon icon={CopyIcon} size="sm" color="inherit" />}
              variant="ghost"
              style={styles.iconTapTarget}
              onClick={copySource}
            />
            <IconButton
              label={isShared ? 'Share link copied' : 'Share playground link'}
              tooltip={isShared ? 'Link copied' : 'Share link'}
              icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}
              variant="ghost"
              style={styles.iconTapTarget}
              onClick={shareLink}
            />
          </>
        ) : (
          <>
            <Button
              label={isCopied ? 'Copied' : 'Copy'}
              variant="secondary"
              size="sm"
              icon={<Icon icon={CopyIcon} size="sm" />}
              onClick={copySource}
            />
            <Tooltip content={`Copies https://${example.shareUrl}`}>
              <Button
                label={isShared ? 'Link copied' : 'Share'}
                variant="secondary"
                size="sm"
                icon={<Icon icon={Share2Icon} size="sm" />}
                onClick={shareLink}
              />
            </Tooltip>
          </>
        )}
      </HStack>
      <Divider />
      <StackItem size="fill" style={styles.columnFill}>
        <EditorPane example={example} />
      </StackItem>
      <Divider />
      <HStack gap={2} style={styles.statusRow}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary" maxLines={1}>
            {example.file} · TypeScript · {example.lines.length} lines
          </Text>
        </StackItem>
        {!isSinglePane && (
          <Text type="supporting" color="secondary">
            spaces: 2 · UTF-8
          </Text>
        )}
      </HStack>
    </Stack>
  );

  // ---- Console column: header / filter tabs / dark output / footer ----

  const consoleColumn = (
    <Stack direction="vertical" style={styles.column}>
      <HStack gap={2} style={styles.consoleHeader}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Heading level={2}>Console</Heading>
            {isRun && (
              <Tooltip content="Wall-clock time of the captured run">
                <span>
                  <Badge label={example.duration} variant="neutral" />
                </span>
              </Tooltip>
            )}
            {isRun && (
              <Badge label={example.exit.label} variant={example.exit.variant} />
            )}
          </HStack>
        </StackItem>
        <IconButton
          label="Clear console"
          tooltip="Clear console"
          icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
          variant="ghost"
          isDisabled={!isRun}
          style={isSinglePane ? styles.iconTapTarget : undefined}
          onClick={clearConsole}
        />
      </HStack>
      <div style={styles.consoleTabs}>
        <TabList
          value={filter}
          onChange={value => setFilter(value as ConsoleFilter)}
          size="sm"
          style={isSinglePane ? styles.tabsTapTarget : undefined}>
          <Tab
            value="all"
            label="All"
            endContent={<Badge label={String(revealed.length)} />}
          />
          <Tab
            value="logs"
            label="Logs"
            endContent={<Badge label={String(logCount)} />}
          />
          <Tab
            value="errors"
            label="Errors"
            endContent={
              <Badge
                label={String(errorCount)}
                variant={errorCount > 0 ? 'error' : 'neutral'}
              />
            }
          />
        </TabList>
      </div>
      <StackItem size="fill" style={styles.columnFill}>
        <div
          role="region"
          aria-label="Console output"
          tabIndex={0}
          style={{...styles.consoleBody, height: '100%'}}>
          {!isRun ? (
            <div style={styles.consoleHint}>
              {/* Inherits CODE.dim — themed colors are off-limits on the
                  scheme-locked dark console surface. */}
              <Icon icon={TerminalIcon} size="lg" color="inherit" />
              <span>
                Press Run to execute {example.file} — its captured output
                will appear here.
              </span>
            </div>
          ) : visible.length === 0 ? (
            <div style={styles.filteredEmpty}>
              {filter === 'errors'
                ? 'No errors in the last run.'
                : 'No log output in the last run.'}
            </div>
          ) : (
            visible.map(entry => {
              switch (entry.kind) {
                case 'log':
                  return <LogEntryRow key={entry.id} entry={entry} />;
                case 'table':
                  return <TableEntryRow key={entry.id} entry={entry} />;
                case 'error':
                  return (
                    <ErrorEntryRow
                      key={entry.id}
                      entry={entry}
                      isStackOpen={!closedStacks[entry.id]}
                      isCompact={isSinglePane}
                      onToggleStack={() => toggleStack(entry.id)}
                    />
                  );
              }
            })
          )}
        </div>
      </StackItem>
      <Divider />
      <HStack gap={2} style={styles.statusRow}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary" maxLines={1}>
            {isRun
              ? `run #${runNumbers[example.id]} · ${example.duration} · ${RUNTIME_LABEL}`
              : `${RUNTIME_LABEL} · idle`}
          </Text>
        </StackItem>
      </HStack>
    </Stack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill" style={styles.headerTitle}>
              <HStack gap={2} vAlign="center">
                <Heading level={1} maxLines={1}>
                  Playground
                </Heading>
                {!isSinglePane && (
                  <Badge label={RUNTIME_LABEL} variant="neutral" />
                )}
              </HStack>
            </StackItem>
            {isSinglePane && (
              <SegmentedControl
                label="Playground view"
                value={mobileView}
                onChange={setMobileView}
                size="sm"
                style={styles.segmentedTapTarget}>
                <SegmentedControlItem label="Editor" value="editor" />
                <SegmentedControlItem label="Console" value="console" />
              </SegmentedControl>
            )}
            <Button
              label="Run"
              variant="primary"
              icon={<Icon icon={PlayIcon} size="sm" />}
              style={tapTargetStyle}
              onClick={runExample}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          {isSinglePane && mobileView === 'console'
            ? consoleColumn
            : editorColumn}
        </LayoutContent>
      }
      end={
        !isSinglePane ? (
          <LayoutPanel
            hasDivider
            width={isPanelNarrow ? 360 : 420}
            padding={0}
            label="Console">
            {consoleColumn}
          </LayoutPanel>
        ) : undefined
      }
    />
  );
}
