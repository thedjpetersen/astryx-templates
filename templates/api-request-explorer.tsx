// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a two-folder collection of 8 saved
 *   API requests — Users and Billing — each carrying key-value params,
 *   headers, an optional JSON body, and a canned response with a fixed
 *   status, base latency, and JSON payload; plus three environments —
 *   dev / staging / prod — that define {{base_url}}-style variables and a
 *   fixed per-environment latency offset)
 * @output Postman-style API request explorer: left, a collection sidebar
 *   with a Collection / History TabList — the collection tree groups
 *   requests by folder with color-coded method labels and a dirty-state
 *   dot on unsaved edits, while the history rail lists past sends and
 *   restores their exact request snapshot on click; center, a request
 *   builder with a method Selector, URL bar, Send / Save / Revert
 *   actions, a live resolved-request strip that substitutes environment
 *   variables and enabled params under the URL, and Params / Headers /
 *   Body tabs whose key-value rows add, toggle, edit, and delete; below,
 *   a response region that animates through a sending phase into a
 *   status / latency / size readout over a pretty-printed JSON body with
 *   collapsible nodes.
 * @position Page template; emitted by `astryx template api-request-explorer`
 *
 * Frame: Layout height="fill". LayoutHeader carries the explorer title,
 * workspace badge, and the environment Selector (plus the Collection /
 * Request SegmentedControl in single-pane mode). The collection sidebar
 * is a fixed-width LayoutPanel on the start side (Collection / History
 * tabs, scrolling tree or history list, sync footnote). LayoutContent
 * owns the builder column: request bar, dark resolved-request strip,
 * builder tabs with the key-value editor, and the response region — the
 * whole column scrolls as one surface so the response is always
 * reachable below the editor.
 *
 * Responsive contract:
 * - >1100px: sidebar panel is 300px; the builder column fills the rest.
 * - <=1100px: sidebar narrows to 260px; the builder keeps fill.
 * - <=640px: single-pane mode — the start panel unmounts and a
 *   Collection / Request SegmentedControl in the header swaps the two
 *   surfaces; picking a request in the tree or restoring a history entry
 *   jumps straight to the Request view so the builder is never
 *   off-screen. The header sheds the workspace badge and the title
 *   truncates to one line. Send keeps its label; Save and Revert
 *   collapse to 40px icon buttons; the method Selector, URL input, add
 *   buttons, checkboxes, and row-delete buttons all sit in >=40px hit
 *   areas; the builder tabs and sidebar tabs get a 40px hit area via the
 *   local size token; JSON collapse toggles grow to >=40px targets.
 *   Nothing is hover-only: every reveal (send, restore, collapse) is
 *   click/tap driven, and both scroll regions are keyboard-focusable.
 * - Usable at 375px: the request bar wraps onto a second row (method +
 *   URL first, actions beneath) instead of overflowing, key-value rows
 *   wrap the value input onto its own line via flex-wrap, and the
 *   resolved strip plus the response JSON scroll horizontally inside
 *   their dark bodies (whiteSpace pre + overflowX auto) rather than
 *   widening the page.
 * - Sidebar list and builder column scroll independently; page chrome,
 *   tabs, and footnotes stay pinned.
 *
 * Container policy (API client archetype): two dark code surfaces only —
 * the resolved-request strip and the response JSON body — both on a
 * fixed terminal palette that stays dark in either theme (they reproduce
 * wire-format text, so they never use themed Text colors). All chrome
 * around them (request bar, tabs, key-value rows, sidebar) is plain
 * frame rows and list components, not Cards.
 *
 * Fixture policy: fixed data only — no Date.now, no Math.random, no
 * network assets. Canned responses are per-request constants, latency is
 * base-plus-environment-offset arithmetic, response sizes derive from
 * the fixture JSON text, and history timestamps advance deterministically
 * from a frozen session clock in fixed 47-second steps. The send
 * animation is a single fixed-length timeout, not a clock read.
 * Destructive edits (row deletes, field changes) are recoverable via the
 * two-tap Revert action, which restores the last saved snapshot.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

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
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  FolderIcon,
  HistoryIcon,
  PlusIcon,
  SaveIcon,
  SendIcon,
  Trash2Icon,
  Undo2Icon,
} from 'lucide-react';

// ============= CODE PALETTE =============
// The resolved-request strip and the response body reproduce wire-format
// text, so they keep a fixed dark palette instead of themed Text colors
// (dark in both themes).

const CODE = {
  bg: '#0d1117',
  bgSubtle: '#161b22',
  border: '#22272e',
  base: '#c9d1d9',
  dim: '#768390',
  string: '#a5d6ff',
  number: '#79c0ff',
  keyword: '#ff7b72',
  prop: '#7ee787',
  varValue: '#d2a8ff',
  varMissing: '#ffa657',
  green: '#3fb950',
  red: '#f47067',
} as const;

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// HTTP method tints used for the mono method labels in the tree/history.
const METHOD_COLORS: Record<string, string> = {
  GET: '#3fb950',
  POST: '#d29922',
  PUT: '#58a6ff',
  PATCH: '#d2a8ff',
  DELETE: '#f47067',
};

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Sidebar / builder columns fill their region; bodies scroll inside.
  pane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  paneScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-2) var(--spacing-3)',
  },
  paneTabs: {padding: 'var(--spacing-2) var(--spacing-2) 0'},
  paneFootnote: {padding: 'var(--spacing-2) var(--spacing-3)'},
  // Mono method label in tree rows: fixed width so names align.
  methodLabel: {
    flex: 'none',
    width: 46,
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.4,
  },
  // Dirty-state dot on unsaved collection entries.
  dirtyDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#d29922',
  },
  // Request bar: wraps onto a second row before clipping at 375px.
  requestBar: {
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-2)',
  },
  methodCell: {flex: 'none', width: 112},
  urlCell: {flex: '1 1 220px', minWidth: 0},
  // Dark resolved-request strip: mono, one line, scrolls in x.
  resolvedStrip: {
    margin: '0 var(--spacing-4) var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 6,
    backgroundColor: CODE.bg,
    border: `1px solid ${CODE.border}`,
    fontFamily: MONO_FONT,
    fontSize: 12,
    lineHeight: 1.6,
    color: CODE.base,
    whiteSpace: 'pre',
    overflowX: 'auto',
  },
  builderTabs: {paddingInline: 'var(--spacing-3)'},
  // Key-value editor: rows wrap so the value input drops to its own
  // line at 375px instead of overflowing.
  kvSection: {padding: 'var(--spacing-3) var(--spacing-4)'},
  kvRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  kvEnableCell: {flex: 'none', minWidth: 28},
  kvKeyCell: {flex: '1 1 130px', minWidth: 110},
  kvValueCell: {flex: '2 1 180px', minWidth: 140},
  // Builder column scrolls as one surface (editor + response).
  builderScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  responseHeader: {
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-2)',
  },
  // Dark response body: mono JSON tree, scrolls in x, never widens page.
  responseBody: {
    margin: '0 var(--spacing-4) var(--spacing-4)',
    borderRadius: 6,
    backgroundColor: CODE.bg,
    border: `1px solid ${CODE.border}`,
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    lineHeight: 1.7,
    color: CODE.base,
    padding: 'var(--spacing-3)',
    overflowX: 'auto',
  },
  responseIdle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-6) var(--spacing-4)',
    color: CODE.dim,
    textAlign: 'center',
  },
  sendingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
    color: CODE.dim,
  },
  jsonLine: {display: 'flex', alignItems: 'center', whiteSpace: 'pre'},
  // Unstyled native button for JSON collapse toggles: mono, real focus.
  jsonToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    minHeight: 24,
    padding: 0,
    border: 'none',
    background: 'transparent',
    fontFamily: MONO_FONT,
    fontSize: 11,
    color: CODE.dim,
    cursor: 'pointer',
  },
  jsonToggleCompact: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    minHeight: 40,
    padding: 0,
    border: 'none',
    background: 'transparent',
    fontFamily: MONO_FONT,
    fontSize: 11,
    color: CODE.dim,
    cursor: 'pointer',
  },
  jsonToggleSpacer: {display: 'inline-block', width: 20},
  jsonToggleSpacerCompact: {display: 'inline-block', width: 40},
  // The header title cell gives way first so actions never clip.
  headerTitle: {minWidth: 0},
  envCell: {flex: 'none', width: 150},
  // ~40px touch targets in single-pane mode (size="sm" renders 28px).
  buttonTapTarget: {height: 40},
  iconTapTarget: {width: 40, height: 40},
  selectorTapTarget: {height: 40},
  // Tab / SegmentedControlItem heights derive from --size-element-sm;
  // raising the token locally gives them a 40px hit area on mobile.
  tabsTapTarget: {'--size-element-sm': '40px'} as CSSProperties,
  segmentedTapTarget: {'--size-element-sm': '40px'} as CSSProperties,
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
// Deterministic fixtures: two folders of saved requests with canned
// responses, and three environments defining {{var}} substitutions.

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const METHODS: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {[key: string]: JsonValue};

/** One key-value row in the Params or Headers editor. */
interface KvRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

/** The editable working copy of a request. */
interface DraftRequest {
  method: Method;
  url: string;
  params: KvRow[];
  headers: KvRow[];
  body: string;
}

interface CannedResponse {
  status: number;
  statusText: string;
  /** Base latency; the environment offset is added on send. */
  latencyMs: number;
  json: JsonValue;
}

interface RequestFixture {
  id: string;
  folderId: 'folder-users' | 'folder-billing';
  name: string;
  method: Method;
  url: string;
  params: KvRow[];
  headers: KvRow[];
  body: string;
  response: CannedResponse;
}

type EnvId = 'dev' | 'staging' | 'prod';

interface Environment {
  id: EnvId;
  label: string;
  variables: Record<string, string>;
  /** Fixed latency added to every canned response in this environment. */
  latencyOffsetMs: number;
}

const ENVIRONMENTS: Environment[] = [
  {
    id: 'dev',
    label: 'Development',
    latencyOffsetMs: 2,
    variables: {
      base_url: 'http://localhost:4000',
      api_version: 'v1',
      api_token: 'dev-token-local',
    },
  },
  {
    id: 'staging',
    label: 'Staging',
    latencyOffsetMs: 38,
    variables: {
      base_url: 'https://staging-api.acme.test',
      api_version: 'v1',
      api_token: 'stg-token-4f2a',
    },
  },
  {
    id: 'prod',
    label: 'Production',
    latencyOffsetMs: 11,
    variables: {
      base_url: 'https://api.acme.test',
      api_version: 'v1',
      api_token: 'prd-token-9c1e',
    },
  },
];

const FOLDERS = [
  {id: 'folder-users' as const, label: 'Users'},
  {id: 'folder-billing' as const, label: 'Billing'},
];

const AUTH_HEADER: KvRow = {
  id: 'h-auth',
  key: 'Authorization',
  value: 'Bearer {{api_token}}',
  enabled: true,
};

const ACCEPT_HEADER: KvRow = {
  id: 'h-accept',
  key: 'Accept',
  value: 'application/json',
  enabled: true,
};

const REQUESTS: RequestFixture[] = [
  {
    id: 'req-list-users',
    folderId: 'folder-users',
    name: 'List users',
    method: 'GET',
    url: '{{base_url}}/{{api_version}}/users',
    params: [
      {id: 'p-limit', key: 'limit', value: '25', enabled: true},
      {id: 'p-status', key: 'status', value: 'active', enabled: true},
      {id: 'p-cursor', key: 'cursor', value: 'usr_099', enabled: false},
    ],
    headers: [AUTH_HEADER, ACCEPT_HEADER],
    body: '',
    response: {
      status: 200,
      statusText: 'OK',
      latencyMs: 62,
      json: {
        data: [
          {id: 'usr_204', name: 'Priya Raman', role: 'admin', active: true},
          {id: 'usr_117', name: 'Marcus Webb', role: 'member', active: true},
          {id: 'usr_093', name: 'Elena Sova', role: 'member', active: false},
        ],
        pagination: {limit: 25, next_cursor: 'usr_093', has_more: false},
        total: 3,
      },
    },
  },
  {
    id: 'req-get-user',
    folderId: 'folder-users',
    name: 'Get user',
    method: 'GET',
    url: '{{base_url}}/{{api_version}}/users/usr_204',
    params: [{id: 'p-expand', key: 'expand', value: 'teams', enabled: true}],
    headers: [AUTH_HEADER, ACCEPT_HEADER],
    body: '',
    response: {
      status: 200,
      statusText: 'OK',
      latencyMs: 41,
      json: {
        id: 'usr_204',
        name: 'Priya Raman',
        email: 'priya@acme.test',
        role: 'admin',
        teams: [
          {id: 'team_11', name: 'Platform'},
          {id: 'team_14', name: 'Billing'},
        ],
        created_at: '2025-11-03T09:12:00Z',
        last_seen_at: '2026-06-30T17:44:00Z',
      },
    },
  },
  {
    id: 'req-create-user',
    folderId: 'folder-users',
    name: 'Create user',
    method: 'POST',
    url: '{{base_url}}/{{api_version}}/users',
    params: [],
    headers: [
      AUTH_HEADER,
      {
        id: 'h-content',
        key: 'Content-Type',
        value: 'application/json',
        enabled: true,
      },
      {
        id: 'h-idem',
        key: 'Idempotency-Key',
        value: 'create-user-0031',
        enabled: true,
      },
    ],
    body: '{\n  "name": "Jonah Reyes",\n  "email": "jonah@acme.test",\n  "role": "member"\n}',
    response: {
      status: 201,
      statusText: 'Created',
      latencyMs: 118,
      json: {
        id: 'usr_311',
        name: 'Jonah Reyes',
        email: 'jonah@acme.test',
        role: 'member',
        active: true,
        created_at: '2026-06-30T18:02:00Z',
      },
    },
  },
  {
    id: 'req-deactivate-user',
    folderId: 'folder-users',
    name: 'Deactivate user',
    method: 'DELETE',
    url: '{{base_url}}/{{api_version}}/users/usr_117',
    params: [{id: 'p-mode', key: 'mode', value: 'soft', enabled: true}],
    headers: [AUTH_HEADER],
    body: '',
    response: {
      status: 200,
      statusText: 'OK',
      latencyMs: 87,
      json: {
        id: 'usr_117',
        active: false,
        deactivated_at: '2026-06-30T18:05:00Z',
        restorable_until: '2026-07-30T18:05:00Z',
      },
    },
  },
  {
    id: 'req-list-invoices',
    folderId: 'folder-billing',
    name: 'List invoices',
    method: 'GET',
    url: '{{base_url}}/{{api_version}}/invoices',
    params: [
      {id: 'p-inv-status', key: 'status', value: 'open', enabled: true},
      {id: 'p-inv-limit', key: 'limit', value: '10', enabled: true},
    ],
    headers: [AUTH_HEADER, ACCEPT_HEADER],
    body: '',
    response: {
      status: 200,
      statusText: 'OK',
      latencyMs: 74,
      json: {
        data: [
          {id: 'inv_5502', amount_cents: 42000, currency: 'usd', status: 'open'},
          {id: 'inv_5498', amount_cents: 9900, currency: 'usd', status: 'open'},
        ],
        total: 2,
      },
    },
  },
  {
    id: 'req-get-invoice',
    folderId: 'folder-billing',
    name: 'Get invoice',
    method: 'GET',
    url: '{{base_url}}/{{api_version}}/invoices/inv_5501',
    params: [],
    headers: [AUTH_HEADER, ACCEPT_HEADER],
    body: '',
    response: {
      status: 404,
      statusText: 'Not Found',
      latencyMs: 33,
      json: {
        error: {
          type: 'resource_missing',
          message: 'No invoice with id inv_5501 exists in this workspace.',
          doc_url: 'https://api.acme.test/docs/errors#resource_missing',
        },
      },
    },
  },
  {
    id: 'req-create-charge',
    folderId: 'folder-billing',
    name: 'Create charge',
    method: 'POST',
    url: '{{base_url}}/{{api_version}}/charges',
    params: [],
    headers: [
      AUTH_HEADER,
      {
        id: 'h-content',
        key: 'Content-Type',
        value: 'application/json',
        enabled: true,
      },
    ],
    body: '{\n  "customer": "usr_204",\n  "amount_cents": 129900,\n  "currency": "usd",\n  "description": "Annual plan renewal"\n}',
    response: {
      status: 402,
      statusText: 'Payment Required',
      latencyMs: 214,
      json: {
        error: {
          type: 'card_declined',
          code: 'insufficient_funds',
          message: 'The card on file was declined.',
          charge_id: 'ch_20114',
          retryable: true,
        },
      },
    },
  },
  {
    id: 'req-usage-report',
    folderId: 'folder-billing',
    name: 'Usage summary',
    method: 'GET',
    url: '{{base_url}}/{{api_version}}/usage/summary',
    params: [
      {id: 'p-period', key: 'period', value: '2026-06', enabled: true},
      {id: 'p-group', key: 'group_by', value: 'team', enabled: false},
    ],
    headers: [AUTH_HEADER, ACCEPT_HEADER],
    body: '',
    response: {
      status: 200,
      statusText: 'OK',
      latencyMs: 156,
      json: {
        period: '2026-06',
        api_calls: 184203,
        storage_gb: 41.7,
        seats: {licensed: 25, active: 21},
        overage: null,
        breakdown: [
          {bucket: 'reads', calls: 141002},
          {bucket: 'writes', calls: 39120},
          {bucket: 'admin', calls: 4081},
        ],
      },
    },
  },
];

// History clocks: frozen session start, fixed 47-second steps per send.
const SESSION_CLOCK_START = 9 * 3600 + 41 * 60 + 7; // 09:41:07
const SESSION_CLOCK_STEP = 47;
const SEND_ANIMATION_MS = 450;

// ============= HELPERS =============

function requestOf(id: string): RequestFixture {
  return REQUESTS.find(request => request.id === id) ?? REQUESTS[0];
}

function cloneRows(rows: KvRow[]): KvRow[] {
  return rows.map(row => ({...row}));
}

function draftFrom(fixture: RequestFixture): DraftRequest {
  return {
    method: fixture.method,
    url: fixture.url,
    params: cloneRows(fixture.params),
    headers: cloneRows(fixture.headers),
    body: fixture.body,
  };
}

function cloneDraft(draft: DraftRequest): DraftRequest {
  return {
    ...draft,
    params: cloneRows(draft.params),
    headers: cloneRows(draft.headers),
  };
}

/** Stable serialization used for dirty-state comparison. */
function serializeDraft(draft: DraftRequest): string {
  return JSON.stringify(draft);
}

function initialDrafts(): Record<string, DraftRequest> {
  const drafts: Record<string, DraftRequest> = {};
  for (const fixture of REQUESTS) {
    drafts[fixture.id] = draftFrom(fixture);
  }
  return drafts;
}

function initialSnapshots(): Record<string, string> {
  const snapshots: Record<string, string> = {};
  for (const fixture of REQUESTS) {
    snapshots[fixture.id] = serializeDraft(draftFrom(fixture));
  }
  return snapshots;
}

/** Substitute {{var}} placeholders; unknown names stay in braces. */
function resolveTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    vars[name] !== undefined ? vars[name] : match,
  );
}

/** Query string from the enabled, non-empty param rows. */
function buildQueryString(
  params: KvRow[],
  vars: Record<string, string>,
): string {
  const pairs = params
    .filter(row => row.enabled && row.key.trim() !== '')
    .map(
      row =>
        `${row.key.trim()}=${resolveTemplate(row.value, vars)}`,
    );
  return pairs.length === 0 ? '' : `?${pairs.join('&')}`;
}

interface TemplateSegment {
  kind: 'literal' | 'resolved' | 'missing';
  text: string;
}

/**
 * Split a {{var}} template into render segments: literals, substituted
 * values (tinted), and unresolved names (kept in braces, flagged).
 */
function templateSegments(
  text: string,
  vars: Record<string, string>,
): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  const pattern = /\{\{(\w+)\}\}/g;
  let cursor = 0;
  let match = pattern.exec(text);
  while (match !== null) {
    if (match.index > cursor) {
      segments.push({kind: 'literal', text: text.slice(cursor, match.index)});
    }
    const value = vars[match[1]];
    if (value !== undefined) {
      segments.push({kind: 'resolved', text: value});
    } else {
      segments.push({kind: 'missing', text: match[0]});
    }
    cursor = match.index + match[0].length;
    match = pattern.exec(text);
  }
  if (cursor < text.length) {
    segments.push({kind: 'literal', text: text.slice(cursor)});
  }
  return segments;
}

function formatClock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Payload size from the pretty-printed fixture text. */
function formatSize(json: JsonValue): string {
  const bytes = JSON.stringify(json, null, 2).length;
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

function statusVariant(status: number): 'success' | 'error' | 'neutral' {
  if (status < 300) {
    return 'success';
  }
  if (status >= 400) {
    return 'error';
  }
  return 'neutral';
}

// ============= JSON TREE =============

function primitiveColor(value: string | number | boolean | null): string {
  if (typeof value === 'string') {
    return CODE.string;
  }
  if (typeof value === 'number') {
    return CODE.number;
  }
  return CODE.keyword;
}

function formatPrimitive(value: string | number | boolean | null): string {
  return value === null ? 'null' : JSON.stringify(value);
}

interface JsonNodeProps {
  value: JsonValue;
  name: string | null;
  path: string;
  depth: number;
  isLast: boolean;
  collapsedPaths: Record<string, boolean>;
  isCompact: boolean;
  onToggle: (path: string) => void;
}

/**
 * Pretty-printed JSON with collapsible object/array nodes. Every toggle
 * is a real button (aria-expanded, >=40px on touch layouts) — no
 * hover-only affordances — and collapsed nodes summarize their size.
 */
function JsonNode({
  value,
  name,
  path,
  depth,
  isLast,
  collapsedPaths,
  isCompact,
  onToggle,
}: JsonNodeProps) {
  const spacerStyle = isCompact
    ? styles.jsonToggleSpacerCompact
    : styles.jsonToggleSpacer;
  const indentStyle: CSSProperties = {paddingLeft: depth * 14};
  const comma = isLast ? '' : ',';
  const keyNode =
    name !== null ? (
      <>
        <span style={{color: CODE.prop}}>&quot;{name}&quot;</span>
        <span>: </span>
      </>
    ) : null;

  if (value === null || typeof value !== 'object') {
    return (
      <div style={{...styles.jsonLine, ...indentStyle}}>
        <span style={spacerStyle} aria-hidden />
        <span>
          {keyNode}
          <span style={{color: primitiveColor(value)}}>
            {formatPrimitive(value)}
          </span>
          {comma}
        </span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries: Array<[string | null, JsonValue]> = isArray
    ? value.map((item): [string | null, JsonValue] => [null, item])
    : Object.entries(value);
  const open = isArray ? '[' : '{';
  const close = isArray ? ']' : '}';
  const isCollapsed = collapsedPaths[path] === true;
  const summary = isArray
    ? `${entries.length} ${entries.length === 1 ? 'item' : 'items'}`
    : `${entries.length} ${entries.length === 1 ? 'key' : 'keys'}`;
  const toggleLabel = `${isCollapsed ? 'Expand' : 'Collapse'} ${
    name ?? 'response root'
  }`;

  return (
    <div>
      <div style={{...styles.jsonLine, ...indentStyle}}>
        <button
          type="button"
          aria-expanded={!isCollapsed}
          aria-label={toggleLabel}
          style={isCompact ? styles.jsonToggleCompact : styles.jsonToggle}
          onClick={() => onToggle(path)}>
          {isCollapsed ? '▸' : '▾'}
        </button>
        <span>
          {keyNode}
          {open}
          {isCollapsed && (
            <span style={{color: CODE.dim}}>
              {' … '}
              {summary}
              {' '}
              {close}
            </span>
          )}
          {isCollapsed && comma}
        </span>
      </div>
      {!isCollapsed && (
        <>
          {entries.map(([childName, childValue], index) => {
            const childPath = isArray
              ? `${path}[${index}]`
              : `${path}.${childName ?? index}`;
            return (
              <JsonNode
                key={childPath}
                value={childValue}
                name={childName}
                path={childPath}
                depth={depth + 1}
                isLast={index === entries.length - 1}
                collapsedPaths={collapsedPaths}
                isCompact={isCompact}
                onToggle={onToggle}
              />
            );
          })}
          <div style={{...styles.jsonLine, ...indentStyle}}>
            <span style={spacerStyle} aria-hidden />
            <span>
              {close}
              {comma}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ============= KEY-VALUE EDITOR =============

interface KvEditorProps {
  kind: 'params' | 'headers';
  rows: KvRow[];
  isCompact: boolean;
  onRowChange: (rowId: string, patch: Partial<Omit<KvRow, 'id'>>) => void;
  onRowDelete: (rowId: string) => void;
  onRowAdd: () => void;
}

/**
 * Key-value rows for Params and Headers: enable checkbox, key and value
 * inputs, and a delete button per row, plus an add-row action. Rows wrap
 * at narrow widths so the value input drops to its own line.
 */
function KvEditor({
  kind,
  rows,
  isCompact,
  onRowChange,
  onRowDelete,
  onRowAdd,
}: KvEditorProps) {
  const noun = kind === 'params' ? 'query param' : 'header';
  return (
    <div style={styles.kvSection}>
      {rows.length === 0 && (
        <Text type="supporting" color="secondary">
          No {noun}s yet — add one below.
        </Text>
      )}
      {rows.map(row => (
        <div key={row.id} style={styles.kvRow}>
          <div style={styles.kvEnableCell}>
            <CheckboxInput
              label={`Enable ${noun} ${row.key === '' ? '(unnamed)' : row.key}`}
              isLabelHidden
              size={isCompact ? 'md' : 'sm'}
              value={row.enabled}
              onChange={checked => onRowChange(row.id, {enabled: checked})}
            />
          </div>
          <div style={styles.kvKeyCell}>
            <TextInput
              label={`${noun} key`}
              isLabelHidden
              size="sm"
              placeholder="Key"
              value={row.key}
              onChange={next => onRowChange(row.id, {key: next})}
              style={isCompact ? styles.selectorTapTarget : undefined}
            />
          </div>
          <div style={styles.kvValueCell}>
            <TextInput
              label={`${noun} value`}
              isLabelHidden
              size="sm"
              placeholder="Value or {{variable}}"
              value={row.value}
              onChange={next => onRowChange(row.id, {value: next})}
              style={isCompact ? styles.selectorTapTarget : undefined}
            />
          </div>
          <IconButton
            label={`Delete ${noun} ${row.key === '' ? '(unnamed)' : row.key}`}
            tooltip="Delete row"
            icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            style={isCompact ? styles.iconTapTarget : undefined}
            onClick={() => onRowDelete(row.id)}
          />
        </div>
      ))}
      <Button
        label={`Add ${noun}`}
        variant="ghost"
        size="sm"
        icon={<Icon icon={PlusIcon} size="sm" />}
        style={isCompact ? styles.buttonTapTarget : undefined}
        onClick={onRowAdd}
      />
    </div>
  );
}

// ============= HISTORY TYPES =============

interface ResponseRecord {
  method: Method;
  resolvedUrl: string;
  status: number;
  statusText: string;
  latencyMs: number;
  sizeLabel: string;
  envId: EnvId;
  json: JsonValue;
}

interface HistoryEntry {
  id: string;
  requestId: string;
  requestName: string;
  clock: string;
  envId: EnvId;
  /** Exact draft at send time — restored on click. */
  snapshot: DraftRequest;
  record: ResponseRecord;
}

// ============= PAGE =============

export default function ApiRequestExplorerTemplate() {
  const [selectedId, setSelectedId] = useState<string>(REQUESTS[0].id);
  const [envId, setEnvId] = useState<EnvId>('staging');
  // Working copies per request; saved snapshots drive the dirty dots.
  const [drafts, setDrafts] = useState<Record<string, DraftRequest>>(
    initialDrafts,
  );
  const [savedSnapshots, setSavedSnapshots] = useState<Record<string, string>>(
    initialSnapshots,
  );
  const [builderTab, setBuilderTab] = useState<'params' | 'headers' | 'body'>(
    'params',
  );
  const [sidebarTab, setSidebarTab] = useState<'collection' | 'history'>(
    'collection',
  );
  // Send lifecycle: idle -> sending (fixed-length timeout) -> idle.
  const [isSending, setIsSending] = useState(false);
  const [responses, setResponses] = useState<Record<string, ResponseRecord>>(
    {},
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [collapsedPaths, setCollapsedPaths] = useState<
    Record<string, boolean>
  >({});
  // Two-tap Revert: first tap arms, second tap restores the snapshot.
  const [isRevertArmed, setIsRevertArmed] = useState(false);
  // Deterministic id counter for rows added in the editor.
  const [nextRowId, setNextRowId] = useState(100);
  const [announcement, setAnnouncement] = useState('');
  // Single-pane mode below 640px: one surface at a time.
  const [mobileView, setMobileView] = useState('request');

  const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (sendTimer.current !== null) {
        clearTimeout(sendTimer.current);
      }
    },
    [],
  );

  const isSinglePane = useMediaQuery('(max-width: 640px)');
  const isPanelNarrow = useMediaQuery('(max-width: 1100px)');

  const fixture = requestOf(selectedId);
  const draft = drafts[selectedId];
  const environment =
    ENVIRONMENTS.find(env => env.id === envId) ?? ENVIRONMENTS[0];
  const vars = environment.variables;

  const isDirty = serializeDraft(draft) !== savedSnapshots[selectedId];
  const queryString = buildQueryString(draft.params, vars);
  const resolvedUrl = resolveTemplate(draft.url, vars) + queryString;
  const urlSegments = templateSegments(draft.url, vars);
  const enabledParams = draft.params.filter(row => row.enabled).length;
  const enabledHeaders = draft.headers.filter(row => row.enabled).length;
  const response = responses[selectedId];

  // Grow the sm controls to ~40px touch targets in single-pane mode.
  const tapTargetStyle = isSinglePane ? styles.buttonTapTarget : undefined;

  const updateDraft = (patch: Partial<DraftRequest>) => {
    setDrafts(prev => ({
      ...prev,
      [selectedId]: {...prev[selectedId], ...patch},
    }));
    setIsRevertArmed(false);
  };

  const updateRows = (
    kind: 'params' | 'headers',
    rowId: string,
    patch: Partial<Omit<KvRow, 'id'>>,
  ) => {
    updateDraft({
      [kind]: draft[kind].map(row =>
        row.id === rowId ? {...row, ...patch} : row,
      ),
    });
  };

  const deleteRow = (kind: 'params' | 'headers', rowId: string) => {
    updateDraft({[kind]: draft[kind].filter(row => row.id !== rowId)});
  };

  const addRow = (kind: 'params' | 'headers') => {
    const row: KvRow = {
      id: `row-${nextRowId}`,
      key: '',
      value: '',
      enabled: true,
    };
    setNextRowId(prev => prev + 1);
    updateDraft({[kind]: [...draft[kind], row]});
  };

  const selectRequest = (requestId: string) => {
    setSelectedId(requestId);
    setIsRevertArmed(false);
    setCollapsedPaths({});
    if (isSinglePane) {
      setMobileView('request');
    }
  };

  const saveRequest = () => {
    setSavedSnapshots(prev => ({
      ...prev,
      [selectedId]: serializeDraft(draft),
    }));
    setIsRevertArmed(false);
    setAnnouncement(`Saved changes to ${fixture.name}`);
  };

  const revertRequest = () => {
    if (!isRevertArmed) {
      setIsRevertArmed(true);
      return;
    }
    const saved = JSON.parse(savedSnapshots[selectedId]) as DraftRequest;
    setDrafts(prev => ({...prev, [selectedId]: saved}));
    setIsRevertArmed(false);
    setAnnouncement(`Reverted ${fixture.name} to its saved state`);
  };

  const sendRequest = () => {
    if (isSending) {
      return;
    }
    setIsSending(true);
    const snapshot = cloneDraft(draft);
    const requestId = selectedId;
    const requestName = fixture.name;
    const canned = fixture.response;
    const latency = canned.latencyMs + environment.latencyOffsetMs;
    const record: ResponseRecord = {
      method: snapshot.method,
      resolvedUrl,
      status: canned.status,
      statusText: canned.statusText,
      latencyMs: latency,
      sizeLabel: formatSize(canned.json),
      envId: environment.id,
      json: canned.json,
    };
    if (sendTimer.current !== null) {
      clearTimeout(sendTimer.current);
    }
    sendTimer.current = setTimeout(() => {
      setResponses(prev => ({...prev, [requestId]: record}));
      setHistory(prev => [
        {
          id: `run-${prev.length + 1}`,
          requestId,
          requestName,
          clock: formatClock(
            SESSION_CLOCK_START + prev.length * SESSION_CLOCK_STEP,
          ),
          envId: environment.id,
          snapshot,
          record,
        },
        ...prev,
      ]);
      setCollapsedPaths({});
      setIsSending(false);
      setAnnouncement(
        `${record.status} ${record.statusText} in ${record.latencyMs} ms`,
      );
    }, SEND_ANIMATION_MS);
  };

  const restoreHistory = (entry: HistoryEntry) => {
    setSelectedId(entry.requestId);
    setDrafts(prev => ({
      ...prev,
      [entry.requestId]: cloneDraft(entry.snapshot),
    }));
    setResponses(prev => ({...prev, [entry.requestId]: entry.record}));
    setCollapsedPaths({});
    setIsRevertArmed(false);
    setAnnouncement(`Restored ${entry.requestName} from ${entry.clock}`);
    if (isSinglePane) {
      setMobileView('request');
    }
  };

  const toggleJsonPath = (path: string) => {
    setCollapsedPaths(prev => ({...prev, [path]: !prev[path]}));
  };

  // ---- Collection tree ----

  const treeItems: TreeListItemData[] = FOLDERS.map(folder => ({
    id: folder.id,
    label: folder.label,
    isExpanded: true,
    startContent: <Icon icon={FolderIcon} size="sm" color="secondary" />,
    children: REQUESTS.filter(request => request.folderId === folder.id).map(
      request => {
        const rowDraft = drafts[request.id];
        const rowDirty =
          serializeDraft(rowDraft) !== savedSnapshots[request.id];
        return {
          id: request.id,
          label: request.name,
          startContent: (
            <span
              style={{
                ...styles.methodLabel,
                color: METHOD_COLORS[rowDraft.method],
              }}
              aria-hidden>
              {rowDraft.method}
            </span>
          ),
          endContent: rowDirty ? (
            <span
              style={styles.dirtyDot}
              role="img"
              aria-label="Unsaved changes"
            />
          ) : undefined,
          isSelected: request.id === selectedId,
          onClick: () => selectRequest(request.id),
        };
      },
    ),
  }));

  // ---- Sidebar: collection / history tabs over a scrolling list ----

  const sidebarPane = (
    <div style={styles.pane}>
      <div style={styles.paneTabs}>
        <TabList
          value={sidebarTab}
          onChange={value =>
            setSidebarTab(value as 'collection' | 'history')
          }
          size="sm"
          style={isSinglePane ? styles.tabsTapTarget : undefined}>
          <Tab value="collection" label="Collection" />
          <Tab
            value="history"
            label="History"
            endContent={<Badge label={String(history.length)} />}
          />
        </TabList>
      </div>
      <div style={styles.paneScroll}>
        {sidebarTab === 'collection' ? (
          <TreeList
            density="compact"
            items={treeItems}
            header={
              <Text type="label" size="sm" color="secondary">
                Acme Core API · 8 requests
              </Text>
            }
          />
        ) : history.length === 0 ? (
          <VStack gap={2} style={{padding: 'var(--spacing-4)'}}>
            <Icon icon={HistoryIcon} size="lg" color="secondary" />
            <Text type="supporting" color="secondary">
              No sends yet this session. Send a request and it will appear
              here — click any entry to restore that exact request.
            </Text>
          </VStack>
        ) : (
          <List density="compact" hasDividers={false}>
            {history.map(entry => (
              <ListItem
                key={entry.id}
                label={
                  <HStack gap={1} vAlign="center">
                    <span
                      style={{
                        ...styles.methodLabel,
                        color: METHOD_COLORS[entry.snapshot.method],
                      }}
                      aria-hidden>
                      {entry.snapshot.method}
                    </span>
                    <Text type="body" maxLines={1}>
                      {entry.requestName}
                    </Text>
                  </HStack>
                }
                description={`${entry.clock} · ${entry.record.status} ${entry.record.statusText} · ${entry.record.latencyMs} ms · ${entry.envId}`}
                onClick={() => restoreHistory(entry)}
              />
            ))}
          </List>
        )}
      </div>
      <Divider />
      <div style={styles.paneFootnote}>
        <Text type="supporting" color="secondary" maxLines={1}>
          Synced from workspace fixtures · read-only collection
        </Text>
      </div>
    </div>
  );

  // ---- Builder column: request bar / resolved strip / tabs / response ----

  const requestBar = (
    <HStack gap={2} style={styles.requestBar}>
      <div style={styles.methodCell}>
        <Selector
          label="HTTP method"
          isLabelHidden
          size="sm"
          options={METHODS.map(method => ({value: method, label: method}))}
          value={draft.method}
          onChange={value => updateDraft({method: value as Method})}
          style={isSinglePane ? styles.selectorTapTarget : undefined}
        />
      </div>
      <StackItem size="fill" style={styles.urlCell}>
        <TextInput
          label="Request URL"
          isLabelHidden
          size="sm"
          placeholder="{{base_url}}/path"
          value={draft.url}
          onChange={next => updateDraft({url: next})}
          style={isSinglePane ? styles.selectorTapTarget : undefined}
        />
      </StackItem>
      <Button
        label={isSending ? 'Sending…' : 'Send'}
        variant="primary"
        size="sm"
        isDisabled={isSending}
        icon={<Icon icon={SendIcon} size="sm" />}
        style={tapTargetStyle}
        onClick={sendRequest}
      />
      {isSinglePane ? (
        <>
          <IconButton
            label={isDirty ? 'Save request (unsaved changes)' : 'Save request'}
            tooltip="Save request"
            icon={<Icon icon={SaveIcon} size="sm" color="inherit" />}
            variant="secondary"
            isDisabled={!isDirty}
            style={styles.iconTapTarget}
            onClick={saveRequest}
          />
          {isDirty && (
            <IconButton
              label={
                isRevertArmed
                  ? 'Tap again to discard changes'
                  : 'Revert to saved'
              }
              tooltip={isRevertArmed ? 'Tap again to discard' : 'Revert'}
              icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
              variant={isRevertArmed ? 'primary' : 'ghost'}
              style={styles.iconTapTarget}
              onClick={revertRequest}
            />
          )}
        </>
      ) : (
        <>
          <Tooltip
            content={
              isDirty
                ? 'Write the working copy back to the collection'
                : 'No unsaved changes'
            }>
            <Button
              label="Save"
              variant="secondary"
              size="sm"
              isDisabled={!isDirty}
              icon={<Icon icon={SaveIcon} size="sm" />}
              onClick={saveRequest}
            />
          </Tooltip>
          {isDirty && (
            <Button
              label={isRevertArmed ? 'Discard changes?' : 'Revert'}
              variant={isRevertArmed ? 'primary' : 'ghost'}
              size="sm"
              icon={<Icon icon={Undo2Icon} size="sm" />}
              onClick={revertRequest}
            />
          )}
        </>
      )}
    </HStack>
  );

  const resolvedStrip = (
    <div
      role="region"
      aria-label="Resolved request preview"
      tabIndex={0}
      style={styles.resolvedStrip}>
      <span style={{color: METHOD_COLORS[draft.method]}}>
        {draft.method}{' '}
      </span>
      {urlSegments.map((segment, index) => (
        <span
          key={`seg-${index}`}
          style={
            segment.kind === 'resolved'
              ? {color: CODE.varValue}
              : segment.kind === 'missing'
                ? {color: CODE.varMissing}
                : undefined
          }>
          {segment.text}
        </span>
      ))}
      {queryString !== '' && (
        <span style={{color: CODE.string}}>{queryString}</span>
      )}
      <span style={{color: CODE.dim}}>
        {'  ·  '}
        {environment.id} · {enabledHeaders} header
        {enabledHeaders === 1 ? '' : 's'}
      </span>
    </div>
  );

  const builderTabs = (
    <div style={styles.builderTabs}>
      <TabList
        value={builderTab}
        onChange={value =>
          setBuilderTab(value as 'params' | 'headers' | 'body')
        }
        size="sm"
        style={isSinglePane ? styles.tabsTapTarget : undefined}>
        <Tab
          value="params"
          label="Params"
          endContent={
            <Badge label={`${enabledParams}/${draft.params.length}`} />
          }
        />
        <Tab
          value="headers"
          label="Headers"
          endContent={
            <Badge label={`${enabledHeaders}/${draft.headers.length}`} />
          }
        />
        <Tab
          value="body"
          label="Body"
          endContent={
            draft.body.trim() !== '' ? <Badge label="JSON" /> : undefined
          }
        />
      </TabList>
    </div>
  );

  const bodyEditor = (
    <div style={styles.kvSection}>
      <VStack gap={2}>
        {(draft.method === 'GET' || draft.method === 'DELETE') && (
          <Text type="supporting" color="secondary">
            {draft.method} requests are usually sent without a body — the
            canned response ignores it either way.
          </Text>
        )}
        <TextArea
          label="Request body (JSON)"
          isLabelHidden
          rows={8}
          placeholder='{"key": "value"}'
          value={draft.body}
          onChange={next => updateDraft({body: next})}
        />
      </VStack>
    </div>
  );

  const responseRegion = (
    <>
      <HStack gap={2} style={styles.responseHeader}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Heading level={5} accessibilityLevel={2}>
              Response
            </Heading>
            {response != null && !isSending && (
              <>
                <Badge
                  label={`${response.status} ${response.statusText}`}
                  variant={statusVariant(response.status)}
                />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {response.latencyMs} ms
                </Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {response.sizeLabel}
                </Text>
                {!isSinglePane && (
                  <Badge label={response.envId} variant="neutral" />
                )}
              </>
            )}
          </HStack>
        </StackItem>
      </HStack>
      {isSending ? (
        <div style={styles.sendingRow}>
          <Spinner size="sm" label="Sending request" />
          <Text type="supporting" color="secondary">
            Sending {draft.method} to {environment.id}…
          </Text>
        </div>
      ) : response == null ? (
        <div style={{...styles.responseBody, marginTop: 0}}>
          <div style={styles.responseIdle}>
            <Icon icon={SendIcon} size="lg" color="secondary" />
            <span>
              Press Send to fire {fixture.name} against {environment.label} —
              the canned response lands here.
            </span>
          </div>
        </div>
      ) : (
        <div
          role="region"
          aria-label="Response body"
          tabIndex={0}
          style={styles.responseBody}>
          <div style={{color: CODE.dim, marginBottom: 4}}>
            {response.method} {response.resolvedUrl}
          </div>
          <JsonNode
            value={response.json}
            name={null}
            path="$"
            depth={0}
            isLast
            collapsedPaths={collapsedPaths}
            isCompact={isSinglePane}
            onToggle={toggleJsonPath}
          />
        </div>
      )}
    </>
  );

  const builderColumn = (
    <Stack direction="vertical" style={{height: '100%', minHeight: 0}}>
      <StackItem size="fill" style={styles.builderScroll}>
        {requestBar}
        {resolvedStrip}
        {builderTabs}
        {builderTab === 'params' && (
          <KvEditor
            kind="params"
            rows={draft.params}
            isCompact={isSinglePane}
            onRowChange={(rowId, patch) => updateRows('params', rowId, patch)}
            onRowDelete={rowId => deleteRow('params', rowId)}
            onRowAdd={() => addRow('params')}
          />
        )}
        {builderTab === 'headers' && (
          <KvEditor
            kind="headers"
            rows={draft.headers}
            isCompact={isSinglePane}
            onRowChange={(rowId, patch) => updateRows('headers', rowId, patch)}
            onRowDelete={rowId => deleteRow('headers', rowId)}
            onRowAdd={() => addRow('headers')}
          />
        )}
        {builderTab === 'body' && bodyEditor}
        <Divider />
        {responseRegion}
      </StackItem>
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
                  API Explorer
                </Heading>
                {!isSinglePane && (
                  <Badge label="Acme Core API" variant="neutral" />
                )}
              </HStack>
            </StackItem>
            {isSinglePane && (
              <SegmentedControl
                label="Explorer view"
                value={mobileView}
                onChange={setMobileView}
                size="sm"
                style={styles.segmentedTapTarget}>
                <SegmentedControlItem label="Collection" value="collection" />
                <SegmentedControlItem label="Request" value="request" />
              </SegmentedControl>
            )}
            <div style={styles.envCell}>
              <Selector
                label="Environment"
                isLabelHidden
                size="sm"
                options={ENVIRONMENTS.map(env => ({
                  value: env.id,
                  label: env.label,
                }))}
                value={envId}
                onChange={value => setEnvId(value as EnvId)}
                style={isSinglePane ? styles.selectorTapTarget : undefined}
              />
            </div>
          </HStack>
        </LayoutHeader>
      }
      start={
        !isSinglePane ? (
          <LayoutPanel
            hasDivider
            width={isPanelNarrow ? 260 : 300}
            padding={0}
            label="Collection">
            {sidebarPane}
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {isSinglePane && mobileView === 'collection'
            ? sidebarPane
            : builderColumn}
        </LayoutContent>
      }
    />
  );
}
