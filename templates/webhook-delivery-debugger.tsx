// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (4 registered webhook endpoints — an
 *   order-sync partner, a billing bridge, an analytics firehose, and a
 *   failing legacy ERP connector with exhausted retries — plus 30 outbound
 *   deliveries across 6 event types, each carrying a JSON payload, canned
 *   response headers/body, HMAC signature details, and an attempt history
 *   with backoff intervals)
 * @output Outbound-webhook inspection console: left, an endpoints rail with
 *   live health percentages derived from delivery outcomes; center, a
 *   delivery feed filterable by response-status class (2xx / 4xx / 5xx /
 *   timeout) and by event-type chips whose available set mirrors the scoped
 *   endpoints' subscriptions; right, a detail pane with Payload / Response /
 *   Signature / Attempts tabs — the payload renders as a collapsible JSON
 *   tree with a select-key copy-path affordance, and the attempt timeline
 *   interleaves backoff-wait rows between attempts. Replay enqueues a
 *   pending attempt that resolves to a canned success, updating the
 *   delivery's status chip and the endpoint's health percentage in one
 *   pass. A settings drawer (docked in the detail region) edits the retry
 *   policy and toggles event-type subscriptions, with the feed's chip row
 *   reflecting subscription changes immediately.
 * @position Page template; emitted by `astryx template webhook-delivery-debugger`
 *
 * Frame: Layout height="fill". LayoutHeader carries the console title, a
 * delivered-count summary, and (in single-pane mode) the Endpoints / Feed /
 * Detail SegmentedControl. The endpoints rail is a fixed-width start
 * LayoutPanel; LayoutContent owns the feed column (filter bar pinned above
 * a scrolling delivery list); the detail pane / settings drawer share a
 * fixed-width end LayoutPanel. Rail, feed, and detail scroll independently.
 *
 * Responsive contract:
 * - >1240px: endpoints rail 260px, detail pane 440px, feed fills the rest.
 * - 641-1240px: rail narrows to 230px and the detail pane to 360px; the
 *   feed keeps fill and its filter bar wraps onto extra rows as needed.
 * - <=640px: single-pane mode — both panels unmount and an Endpoints /
 *   Feed / Detail SegmentedControl in the header swaps the three surfaces.
 *   Picking an endpoint jumps to Feed; picking a delivery (or opening
 *   endpoint settings) jumps to Detail so nothing lands off-screen. Filter
 *   chips, segmented controls, tabs, JSON toggles, and key-select buttons
 *   all grow to ~40px hit areas via the local size token or explicit
 *   min-heights; nothing is hover-only — every reveal (select, replay,
 *   copy, collapse) is click/tap driven.
 * - Usable at 375px: the header sheds the summary badge and truncates the
 *   title; the filter bar wraps; feed rows keep single-line truncated
 *   labels; the dark payload/response code blocks scroll horizontally
 *   inside their own bodies (whiteSpace pre + overflowX auto) rather than
 *   widening the page; the attempt timeline wraps its metadata line.
 *
 * Container policy (operations console archetype): dense rows and panels,
 * not Cards — the rail and feed are List rows, the detail pane is plain
 * frame rows with two dark code surfaces (payload JSON tree and raw
 * response body) on a fixed terminal palette that stays dark in either
 * theme because they reproduce wire-format text. MetadataList carries
 * response headers and signature fields.
 *
 * Fixture policy: fixed data only — no Date.now, no Math.random, no
 * network assets. Attempt clocks are pre-formatted strings; retry clocks
 * inside a run derive from the previous attempt plus its fixed backoff;
 * replay timestamps advance deterministically from a frozen session clock
 * in fixed 47-second steps; the replay animation is a single fixed-length
 * timeout, not a clock read. Health percentages, status counts, and chip
 * sets are all derived from state so replays and subscription edits
 * recompute them live.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CopyIcon,
  RotateCwIcon,
  Settings2Icon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  WebhookIcon,
  XIcon,
} from 'lucide-react';

// ============= CODE PALETTE =============
// The payload JSON tree and the raw response body reproduce wire-format
// text, so they keep a fixed dark palette instead of themed Text colors
// (dark in both themes).

const CODE = {
  bg: '#0d1117',
  border: '#22272e',
  base: '#c9d1d9',
  dim: '#768390',
  string: '#a5d6ff',
  number: '#79c0ff',
  keyword: '#ff7b72',
  prop: '#7ee787',
  selected: 'rgba(56, 139, 253, 0.22)',
} as const;

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Rail / feed / detail columns fill their region; bodies scroll inside.
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
  },
  paneScrollPadded: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-3) var(--spacing-3)',
  },
  railHeader: {padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)'},
  railFootnote: {padding: 'var(--spacing-2) var(--spacing-3)'},
  filterBar: {
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
  },
  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
    alignItems: 'center',
  },
  // Event-type filter chips: native toggle buttons (aria-pressed), never
  // hover-only, grown to 40px hit areas in single-pane mode.
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 28,
    padding: '2px 10px',
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    fontFamily: MONO_FONT,
    fontSize: 11.5,
    cursor: 'pointer',
  },
  chipActive: {
    border: '1px solid var(--color-border-accent, #388bfd)',
    background: 'var(--color-background-accent-subtle, rgba(56,139,253,0.12))',
    color: 'var(--color-text)',
  },
  chipCompact: {minHeight: 40},
  mono: {fontFamily: MONO_FONT},
  monoSmall: {fontFamily: MONO_FONT, fontSize: 11.5},
  eventId: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
  },
  detailHeader: {
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
  },
  detailTabs: {paddingInline: 'var(--spacing-3)'},
  detailSection: {padding: 'var(--spacing-3)'},
  // Dark code surfaces: mono, scroll in x inside their own bodies.
  codeBlock: {
    borderRadius: 6,
    backgroundColor: CODE.bg,
    border: `1px solid ${CODE.border}`,
    fontFamily: MONO_FONT,
    fontSize: 12,
    lineHeight: 1.7,
    color: CODE.base,
    padding: 'var(--spacing-3)',
    overflowX: 'auto',
  },
  rawBody: {
    margin: 0,
    whiteSpace: 'pre',
  },
  jsonLine: {display: 'flex', alignItems: 'center', whiteSpace: 'pre'},
  jsonLineSelected: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'pre',
    backgroundColor: CODE.selected,
    borderRadius: 3,
  },
  // Unstyled native buttons inside the JSON tree: collapse toggles and
  // key-select (copy-path) affordances, both with real focus targets.
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
  jsonToggleSpacer: {display: 'inline-block', width: 20, flex: 'none'},
  jsonToggleSpacerCompact: {display: 'inline-block', width: 40, flex: 'none'},
  jsonKeyButton: {
    padding: 0,
    border: 'none',
    background: 'transparent',
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: CODE.prop,
    cursor: 'pointer',
    minHeight: 24,
  },
  jsonKeyButtonCompact: {
    padding: 0,
    border: 'none',
    background: 'transparent',
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: CODE.prop,
    cursor: 'pointer',
    minHeight: 40,
  },
  pathBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  pathText: {
    fontFamily: MONO_FONT,
    fontSize: 11.5,
    color: 'var(--color-text-secondary)',
    wordBreak: 'break-all',
  },
  // Attempt timeline: attempt rows with backoff-wait rows interleaved.
  timelineWait: {
    paddingInlineStart: 22,
    borderInlineStart: '2px dotted var(--color-border)',
    marginInlineStart: 5,
  },
  timelineRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  sigDigest: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    wordBreak: 'break-all',
  },
  // ~40px touch targets in single-pane mode (size="sm" renders 28px).
  buttonTapTarget: {height: 40},
  iconTapTarget: {width: 40, height: 40},
  selectorTapTarget: {height: 40},
  tabsTapTarget: {'--size-element-sm': '40px'} as CSSProperties,
  segmentedTapTarget: {'--size-element-sm': '40px'} as CSSProperties,
  headerTitle: {minWidth: 0},
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
// Deterministic fixtures: 4 endpoints, 6 event types, and 30 deliveries
// with fixed attempt histories, payloads, responses, and signatures.

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {[key: string]: JsonValue};

const EVENT_TYPES = [
  'order.created',
  'order.fulfilled',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.updated',
  'refund.created',
] as const;

type EventType = (typeof EVENT_TYPES)[number];

type EndpointId = 'ep-orders' | 'ep-billing' | 'ep-analytics' | 'ep-legacy';

type StatusClass = '2xx' | '4xx' | '5xx' | 'timeout';
type AttemptOutcome = StatusClass | 'pending';

type BackoffMode = 'linear' | 'exponential';

interface EndpointFixture {
  id: EndpointId;
  name: string;
  url: string;
  maxAttempts: number;
  backoffMode: BackoffMode;
  subscriptions: EventType[];
}

/** Mutable per-endpoint settings edited in the drawer. */
interface EndpointSettings {
  maxAttempts: number;
  backoffMode: BackoffMode;
  subscriptions: EventType[];
}

interface Attempt {
  id: string;
  number: number;
  clock: string;
  outcome: AttemptOutcome;
  httpStatus: number | null;
  durationMs: number | null;
  /** Seconds waited before this attempt (null for attempt 1 / replays). */
  backoffBeforeS: number | null;
  isReplay?: boolean;
}

interface ResponseFixture {
  headers: Array<{key: string; value: string}>;
  body: string;
}

interface Delivery {
  id: string;
  eventId: string;
  endpointId: EndpointId;
  eventType: EventType;
  clock: string;
  attempts: Attempt[];
  payload: JsonValue;
  /** Response from the last fixture attempt; null when it timed out. */
  response: ResponseFixture | null;
  signature: {keyId: string; timestamp: string; digest: string};
  sigStatus: 'verified' | 'mismatch';
}

const ENDPOINTS: EndpointFixture[] = [
  {
    id: 'ep-orders',
    name: 'Order sync — Shopfront',
    url: 'https://hooks.shopfront.example/webhooks/acme',
    maxAttempts: 5,
    backoffMode: 'exponential',
    subscriptions: ['order.created', 'order.fulfilled', 'customer.updated'],
  },
  {
    id: 'ep-billing',
    name: 'Billing bridge — Ledgerly',
    url: 'https://api.ledgerly.example/ingest/webhooks',
    maxAttempts: 5,
    backoffMode: 'exponential',
    subscriptions: ['invoice.paid', 'invoice.payment_failed', 'refund.created'],
  },
  {
    id: 'ep-analytics',
    name: 'Analytics firehose',
    url: 'https://collect.metricsbay.example/v2/hooks',
    maxAttempts: 3,
    backoffMode: 'linear',
    subscriptions: ['order.created', 'invoice.paid', 'customer.updated'],
  },
  {
    id: 'ep-legacy',
    name: 'Legacy ERP connector',
    url: 'https://erp.internal.acme.example:8443/hook',
    maxAttempts: 5,
    backoffMode: 'exponential',
    subscriptions: ['order.created', 'order.fulfilled'],
  },
];

// ---- clock arithmetic (fixture-only; no runtime clocks) ----

function parseClock(clock: string): number {
  const [h, m, s] = clock.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

function formatClock(totalSeconds: number): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatWait(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`;
  }
  return `${Math.round(seconds / 3600)}h`;
}

// ---- attempt builders ----

function okAttempt(n: number, a: number, clock: string, ms: number): Attempt {
  return {
    id: `d${n}-a${a}`,
    number: a,
    clock,
    outcome: '2xx',
    httpStatus: 200,
    durationMs: ms,
    backoffBeforeS: null,
  };
}

function errAttempt(
  n: number,
  a: number,
  clock: string,
  code: number,
  ms: number,
  backoffBeforeS: number | null,
): Attempt {
  return {
    id: `d${n}-a${a}`,
    number: a,
    clock,
    outcome: code >= 500 ? '5xx' : '4xx',
    httpStatus: code,
    durationMs: ms,
    backoffBeforeS,
  };
}

function timeoutAttempt(
  n: number,
  a: number,
  clock: string,
  backoffBeforeS: number | null,
): Attempt {
  return {
    id: `d${n}-a${a}`,
    number: a,
    clock,
    outcome: 'timeout',
    httpStatus: null,
    durationMs: 10000,
    backoffBeforeS,
  };
}

const EXP_BACKOFFS = [30, 120, 480, 1920];
const LINEAR_BACKOFFS = [30, 60, 90, 120];

/**
 * A fully exhausted retry run for the legacy connector: five attempts on
 * exponential backoff, mixing 503s and timeouts, clocks derived from the
 * start clock plus the fixed backoff intervals.
 */
function exhaustedRun(
  n: number,
  startClock: string,
  pattern: Array<'503' | 'timeout'>,
): Attempt[] {
  const attempts: Attempt[] = [];
  let at = parseClock(startClock);
  for (let index = 0; index < pattern.length; index += 1) {
    const backoff = index === 0 ? null : EXP_BACKOFFS[index - 1];
    if (backoff !== null) {
      at += backoff;
    }
    const clock = formatClock(at);
    attempts.push(
      pattern[index] === '503'
        ? errAttempt(n, index + 1, clock, 503, 2100 + index * 140, backoff)
        : timeoutAttempt(n, index + 1, clock, backoff),
    );
  }
  return attempts;
}

/** Analytics timeout run: three attempts on linear backoff, all timeouts. */
function timeoutRun(n: number, startClock: string): Attempt[] {
  const attempts: Attempt[] = [];
  let at = parseClock(startClock);
  for (let index = 0; index < 3; index += 1) {
    const backoff = index === 0 ? null : LINEAR_BACKOFFS[index - 1];
    if (backoff !== null) {
      at += backoff;
    }
    attempts.push(timeoutAttempt(n, index + 1, formatClock(at), backoff));
  }
  return attempts;
}

// ---- payload builders (deterministic per-delivery arguments) ----

function orderPayload(
  eventId: string,
  type: EventType,
  orderId: string,
  amountCents: number,
  customer: string,
  items: Array<{sku: string; qty: number; priceCents: number}>,
): JsonValue {
  return {
    api_version: '2026-05-01',
    id: eventId,
    type,
    created: '2026-07-02T14:00:00Z',
    data: {
      object: {
        id: orderId,
        object: 'order',
        amount_cents: amountCents,
        currency: 'usd',
        customer,
        items: items.map(item => ({
          sku: item.sku,
          quantity: item.qty,
          unit_price_cents: item.priceCents,
        })),
        shipping: {method: 'ground', eta_days: 4},
      },
    },
  };
}

function invoicePayload(
  eventId: string,
  type: EventType,
  invoiceId: string,
  amountCents: number,
  customer: string,
  attemptCount: number,
): JsonValue {
  return {
    api_version: '2026-05-01',
    id: eventId,
    type,
    created: '2026-07-02T14:00:00Z',
    data: {
      object: {
        id: invoiceId,
        object: 'invoice',
        amount_due_cents: amountCents,
        currency: 'usd',
        customer,
        status: type === 'invoice.paid' ? 'paid' : 'past_due',
        payment_attempts: attemptCount,
        lines: [
          {description: 'Pro plan — monthly', amount_cents: amountCents},
        ],
      },
    },
  };
}

function customerPayload(
  eventId: string,
  customerId: string,
  name: string,
  plan: string,
  changed: string[],
): JsonValue {
  return {
    api_version: '2026-05-01',
    id: eventId,
    type: 'customer.updated',
    created: '2026-07-02T14:00:00Z',
    data: {
      object: {
        id: customerId,
        object: 'customer',
        name,
        plan,
        delinquent: false,
      },
      previous_attributes: Object.fromEntries(
        changed.map(field => [field, `previous_${field}`]),
      ) as JsonValue,
    },
  };
}

function refundPayload(
  eventId: string,
  refundId: string,
  chargeId: string,
  amountCents: number,
  reason: string,
): JsonValue {
  return {
    api_version: '2026-05-01',
    id: eventId,
    type: 'refund.created',
    created: '2026-07-02T14:00:00Z',
    data: {
      object: {
        id: refundId,
        object: 'refund',
        charge: chargeId,
        amount_cents: amountCents,
        reason,
        status: 'succeeded',
      },
    },
  };
}

// ---- response builders ----

function okResponse(requestId: string): ResponseFixture {
  return {
    headers: [
      {key: 'content-type', value: 'application/json'},
      {key: 'x-request-id', value: requestId},
      {key: 'server', value: 'nginx/1.27'},
      {key: 'connection', value: 'keep-alive'},
    ],
    body: `{\n  "received": true,\n  "request_id": "${requestId}"\n}`,
  };
}

function badRequestResponse(requestId: string, message: string): ResponseFixture {
  return {
    headers: [
      {key: 'content-type', value: 'application/json'},
      {key: 'x-request-id', value: requestId},
      {key: 'server', value: 'nginx/1.27'},
    ],
    body: `{\n  "error": "unprocessable_entity",\n  "message": "${message}",\n  "request_id": "${requestId}"\n}`,
  };
}

function unauthorizedResponse(requestId: string): ResponseFixture {
  return {
    headers: [
      {key: 'content-type', value: 'application/json'},
      {key: 'x-request-id', value: requestId},
      {key: 'www-authenticate', value: 'Signature realm="webhooks"'},
    ],
    body: `{\n  "error": "invalid_signature",\n  "message": "HMAC digest did not match the shared secret.",\n  "request_id": "${requestId}"\n}`,
  };
}

const LEGACY_503_RESPONSE: ResponseFixture = {
  headers: [
    {key: 'content-type', value: 'text/html'},
    {key: 'server', value: 'IBM_HTTP_Server/8.5'},
    {key: 'retry-after', value: '120'},
  ],
  body: '<html>\n  <head><title>503 Service Unavailable</title></head>\n  <body>ERP maintenance window in progress.</body>\n</html>',
};

/** Canned response every successful replay resolves to. */
const REPLAY_RESPONSE: ResponseFixture = okResponse('req_replay_2601');

function sig(timestamp: string, digest: string): Delivery['signature'] {
  return {keyId: 'whsec_key_2026_04', timestamp, digest};
}

const DELIVERIES: Delivery[] = [
  {
    id: 'dlv-01',
    eventId: 'evt_7101',
    endpointId: 'ep-orders',
    eventType: 'order.created',
    clock: '14:21:08',
    attempts: [okAttempt(1, 1, '14:21:08', 188)],
    payload: orderPayload('evt_7101', 'order.created', 'ord_88231', 12900, 'cus_2214', [
      {sku: 'SKU-TRAIL-01', qty: 1, priceCents: 12900},
    ]),
    response: okResponse('req_a1f204'),
    signature: sig('1751464868', 'v1=8f3a1cbb92e4d0a75f6c1e2b9d804a3317c5e6f2a8b94d1c0e7f3a5b6c8d9e01'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-02',
    eventId: 'evt_7098',
    endpointId: 'ep-billing',
    eventType: 'invoice.paid',
    clock: '14:19:41',
    attempts: [
      errAttempt(2, 1, '14:19:41', 503, 2410, null),
      okAttempt(2, 2, '14:20:11', 342),
    ],
    payload: invoicePayload('evt_7098', 'invoice.paid', 'inv_5512', 4900, 'cus_1180', 1),
    response: okResponse('req_b7c118'),
    signature: sig('1751464781', 'v1=2c9e4f7a1b8d6053e2f9a4c7b1d8e60f3a5c9b2e7d4f8a1c6b3e9d0f5a2c8b41'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-03',
    eventId: 'evt_7095',
    endpointId: 'ep-analytics',
    eventType: 'order.created',
    clock: '14:18:57',
    attempts: [okAttempt(3, 1, '14:18:57', 96)],
    payload: orderPayload('evt_7095', 'order.created', 'ord_88229', 45800, 'cus_3307', [
      {sku: 'SKU-CANYON-04', qty: 2, priceCents: 18900},
      {sku: 'SKU-STRAP-11', qty: 1, priceCents: 8000},
    ]),
    response: okResponse('req_c0d955'),
    signature: sig('1751464737', 'v1=6a1d8e3f9c2b7405a8e1f6c3d9b2e7a405f8c1d6b3a9e2f7c4d0b5a8e1f6c392'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-04',
    eventId: 'evt_7093',
    endpointId: 'ep-legacy',
    eventType: 'order.created',
    clock: '14:18:22',
    attempts: exhaustedRun(4, '14:18:22', ['503', '503', 'timeout', '503', 'timeout']),
    payload: orderPayload('evt_7093', 'order.created', 'ord_88229', 45800, 'cus_3307', [
      {sku: 'SKU-CANYON-04', qty: 2, priceCents: 18900},
      {sku: 'SKU-STRAP-11', qty: 1, priceCents: 8000},
    ]),
    response: null,
    signature: sig('1751464702', 'v1=9d2f7a4c1e8b6350f9a2d7c4e1b8f6a3059c2d7f4a1e8b6c3f0a5d9c2e7b4183'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-05',
    eventId: 'evt_7089',
    endpointId: 'ep-orders',
    eventType: 'order.fulfilled',
    clock: '14:16:03',
    attempts: [okAttempt(5, 1, '14:16:03', 214)],
    payload: orderPayload('evt_7089', 'order.fulfilled', 'ord_88214', 8600, 'cus_1042', [
      {sku: 'SKU-FIELD-07', qty: 1, priceCents: 8600},
    ]),
    response: okResponse('req_d4e611'),
    signature: sig('1751464563', 'v1=4b8e1f6c3a9d2e7f0c5b8a1d6e3f9c2b7405d8a1f6e3c9b2d7f4a0c5e8b1d674'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-06',
    eventId: 'evt_7085',
    endpointId: 'ep-orders',
    eventType: 'customer.updated',
    clock: '14:14:47',
    attempts: [okAttempt(6, 1, '14:14:47', 173)],
    payload: customerPayload('evt_7085', 'cus_2214', 'Rivertown Outfitters', 'pro', [
      'shipping_address',
    ]),
    response: okResponse('req_e2a780'),
    signature: sig('1751464487', 'v1=1e6c3f9a2d7b4e8f0a5c1d6b3e9f2c7a405b8d1e6f3a9c2b7d4e0f5a8c1b6d93'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-07',
    eventId: 'evt_7082',
    endpointId: 'ep-billing',
    eventType: 'invoice.payment_failed',
    clock: '14:12:30',
    attempts: [okAttempt(7, 1, '14:12:30', 391)],
    payload: invoicePayload('evt_7082', 'invoice.payment_failed', 'inv_5509', 24900, 'cus_2891', 3),
    response: okResponse('req_f9b342'),
    signature: sig('1751464350', 'v1=7c4a0e5d9b2f8a1c6e3d0f5b8a2c7e4109d6b3f8a1e5c0d7b4f9a2e6c3d8b510'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-08',
    eventId: 'evt_7078',
    endpointId: 'ep-analytics',
    eventType: 'invoice.paid',
    clock: '14:11:02',
    attempts: [okAttempt(8, 1, '14:11:02', 88)],
    payload: invoicePayload('evt_7078', 'invoice.paid', 'inv_5508', 9900, 'cus_1180', 1),
    response: okResponse('req_g1c093'),
    signature: sig('1751464262', 'v1=3f9c2b7d4a0e5f8c1b6d3a9e2f7c40b5d8a1e6f3c9b2d7a4e0f5c8b1d6a3e972'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-09',
    eventId: 'evt_7075',
    endpointId: 'ep-legacy',
    eventType: 'order.fulfilled',
    clock: '14:09:55',
    attempts: exhaustedRun(9, '14:09:55', ['timeout', '503', '503', 'timeout', '503']),
    payload: orderPayload('evt_7075', 'order.fulfilled', 'ord_88198', 21400, 'cus_0977', [
      {sku: 'SKU-RIDGE-02', qty: 1, priceCents: 21400},
    ]),
    response: LEGACY_503_RESPONSE,
    signature: sig('1751464195', 'v1=8a1c6e3d0f5b2a7c4e9d1f6b3a8e2c705f4d9b1a6c3e8f2d7b4a0c5e9d1f6b34'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-10',
    eventId: 'evt_7071',
    endpointId: 'ep-orders',
    eventType: 'order.created',
    clock: '14:08:19',
    attempts: [errAttempt(10, 1, '14:08:19', 422, 260, null)],
    payload: orderPayload('evt_7071', 'order.created', 'ord_88190', 0, 'cus_3418', []),
    response: badRequestResponse('req_h6d227', 'items must contain at least one line'),
    signature: sig('1751464099', 'v1=5d9b2f8a1c6e3d0f7b4a9c2e5f8d1b60a3c7e4f9d2b5a8c1e6f3d0b7a4c9e215'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-11',
    eventId: 'evt_7068',
    endpointId: 'ep-billing',
    eventType: 'refund.created',
    clock: '14:06:44',
    attempts: [okAttempt(11, 1, '14:06:44', 245)],
    payload: refundPayload('evt_7068', 'ref_1204', 'ch_66102', 12900, 'requested_by_customer'),
    response: okResponse('req_i3e514'),
    signature: sig('1751464004', 'v1=0f5b8a2c7e4d1f6b9a3c8e2d5f0b7a4c1e6d9f3b8a5c2e7d4f1b0a6c3e9d5f82'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-12',
    eventId: 'evt_7064',
    endpointId: 'ep-analytics',
    eventType: 'customer.updated',
    clock: '14:05:21',
    attempts: timeoutRun(12, '14:05:21'),
    payload: customerPayload('evt_7064', 'cus_2891', 'Northgate Labs', 'scale', [
      'plan',
      'billing_email',
    ]),
    response: null,
    signature: sig('1751463921', 'v1=2b7d4a0e5f9c1b6d3a8e2f7c4d09b5a1e6f3c8d2b7a4e0f5d9c1b6a3e8f2d701'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-13',
    eventId: 'evt_7061',
    endpointId: 'ep-orders',
    eventType: 'order.created',
    clock: '14:03:58',
    attempts: [okAttempt(13, 1, '14:03:58', 162)],
    payload: orderPayload('evt_7061', 'order.created', 'ord_88184', 15700, 'cus_0451', [
      {sku: 'SKU-TIMBER-09', qty: 1, priceCents: 15700},
    ]),
    response: okResponse('req_j8f930'),
    signature: sig('1751463838', 'v1=6e3d0f5b9a2c7e4f1d8b6a3c0e5f9d2b7a4c1e8f6d3b0a5c9e2f7d4b1a6c3e85'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-14',
    eventId: 'evt_7058',
    endpointId: 'ep-legacy',
    eventType: 'order.created',
    clock: '14:02:36',
    attempts: exhaustedRun(14, '14:02:36', ['503', 'timeout', '503', 'timeout', 'timeout']),
    payload: orderPayload('evt_7058', 'order.created', 'ord_88184', 15700, 'cus_0451', [
      {sku: 'SKU-TIMBER-09', qty: 1, priceCents: 15700},
    ]),
    response: null,
    signature: sig('1751463756', 'v1=9c2e5f8d1b6a3c7e4d0f9b2a5c8e1f6d3b0a7c4e9f2d5b8a1c6e3f0d7b4a2c96'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-15',
    eventId: 'evt_7054',
    endpointId: 'ep-orders',
    eventType: 'order.fulfilled',
    clock: '14:01:12',
    attempts: [okAttempt(15, 1, '14:01:12', 199)],
    payload: orderPayload('evt_7054', 'order.fulfilled', 'ord_88171', 33200, 'cus_2740', [
      {sku: 'SKU-SUMMIT-03', qty: 1, priceCents: 33200},
    ]),
    response: okResponse('req_k2g418'),
    signature: sig('1751463672', 'v1=4d1f6b0a5c9e2f7d4b8a3c6e1f0d5b9a2c7e4f8d1b6a0c3e5f9d2b7a4c1e6f03'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-16',
    eventId: 'evt_7050',
    endpointId: 'ep-billing',
    eventType: 'invoice.paid',
    clock: '13:59:47',
    attempts: [errAttempt(16, 1, '13:59:47', 401, 187, null)],
    payload: invoicePayload('evt_7050', 'invoice.paid', 'inv_5502', 42000, 'cus_3307', 1),
    response: unauthorizedResponse('req_l5h772'),
    signature: sig('1751463587', 'v1=deadbeef00c7e4f1d8b6a3c0e5f9d2b7a4c1e8f6d3b0a5c9e2f7d4b1a6c3e800'),
    sigStatus: 'mismatch',
  },
  {
    id: 'dlv-17',
    eventId: 'evt_7047',
    endpointId: 'ep-analytics',
    eventType: 'order.created',
    clock: '13:58:16',
    attempts: [okAttempt(17, 1, '13:58:16', 104)],
    payload: orderPayload('evt_7047', 'order.created', 'ord_88163', 7400, 'cus_1599', [
      {sku: 'SKU-CREEK-12', qty: 2, priceCents: 3700},
    ]),
    response: okResponse('req_m9i035'),
    signature: sig('1751463496', 'v1=1b6a3c8e2d5f0b7a4c9e1f6d3b8a5c2e7d4f0b9a6c3e8f2d5b1a7c4e0f9d6b32'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-18',
    eventId: 'evt_7043',
    endpointId: 'ep-orders',
    eventType: 'customer.updated',
    clock: '13:56:40',
    attempts: [okAttempt(18, 1, '13:56:40', 151)],
    payload: customerPayload('evt_7043', 'cus_0977', 'Bluewater Kayaks', 'starter', [
      'name',
    ]),
    response: okResponse('req_n1j608'),
    signature: sig('1751463400', 'v1=8e2d5f0b9a6c3e7f4d1b8a5c0e9f2d6b3a7c4e1f8d5b0a9c6e3f2d7b4a1c5e97'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-19',
    eventId: 'evt_7039',
    endpointId: 'ep-legacy',
    eventType: 'order.fulfilled',
    clock: '13:55:09',
    attempts: exhaustedRun(19, '13:55:09', ['503', '503', '503', 'timeout', '503']),
    payload: orderPayload('evt_7039', 'order.fulfilled', 'ord_88151', 5900, 'cus_2103', [
      {sku: 'SKU-DUNE-06', qty: 1, priceCents: 5900},
    ]),
    response: LEGACY_503_RESPONSE,
    signature: sig('1751463309', 'v1=5f0b7a4c9e2d1f6b3a8e5c0d9f2b7a4e1c6f3d8b0a5c9e2f7d4b1a6c3e8f0d54'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-20',
    eventId: 'evt_7036',
    endpointId: 'ep-billing',
    eventType: 'invoice.paid',
    clock: '13:53:31',
    attempts: [okAttempt(20, 1, '13:53:31', 233)],
    payload: invoicePayload('evt_7036', 'invoice.paid', 'inv_5498', 9900, 'cus_1042', 1),
    response: okResponse('req_o7k184'),
    signature: sig('1751463211', 'v1=0d9f2b6a3c7e4f1d5b8a0c9e6f3d2b7a4c1e8f5d0b9a6c3e2f7d4b1a8c5e0f93'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-21',
    eventId: 'evt_7032',
    endpointId: 'ep-orders',
    eventType: 'order.created',
    clock: '13:51:54',
    attempts: [okAttempt(21, 1, '13:51:54', 178)],
    payload: orderPayload('evt_7032', 'order.created', 'ord_88147', 26300, 'cus_2740', [
      {sku: 'SKU-GLACIER-08', qty: 1, priceCents: 26300},
    ]),
    response: okResponse('req_p3l461'),
    signature: sig('1751463114', 'v1=7a4c1e8f5d2b9a6c0e3f7d4b1a8c5e2f9d6b3a0c7e4f1d8b5a2c9e6f3d0b7a45'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-22',
    eventId: 'evt_7029',
    endpointId: 'ep-analytics',
    eventType: 'invoice.paid',
    clock: '13:50:28',
    attempts: [okAttempt(22, 1, '13:50:28', 91)],
    payload: invoicePayload('evt_7029', 'invoice.paid', 'inv_5495', 4900, 'cus_1599', 2),
    response: okResponse('req_q6m209'),
    signature: sig('1751463028', 'v1=3c7e4f0d9b2a5c8e1f6d3b0a7c4e9f2d5b8a1c6e3f0d7b4a9c2e5f8d1b6a3c02'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-23',
    eventId: 'evt_7025',
    endpointId: 'ep-orders',
    eventType: 'order.fulfilled',
    clock: '13:48:50',
    attempts: [okAttempt(23, 1, '13:48:50', 205)],
    payload: orderPayload('evt_7025', 'order.fulfilled', 'ord_88139', 11800, 'cus_1180', [
      {sku: 'SKU-MESA-05', qty: 2, priceCents: 5900},
    ]),
    response: okResponse('req_r0n847'),
    signature: sig('1751462930', 'v1=9e2f7d4b1a6c3e8f0d5b2a9c6e1f4d7b0a3c8e5f2d9b6a1c4e7f0d3b8a5c2e61'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-24',
    eventId: 'evt_7021',
    endpointId: 'ep-billing',
    eventType: 'invoice.payment_failed',
    clock: '13:47:13',
    attempts: [okAttempt(24, 1, '13:47:13', 276)],
    payload: invoicePayload('evt_7021', 'invoice.payment_failed', 'inv_5493', 18700, 'cus_2103', 2),
    response: okResponse('req_s4o526'),
    signature: sig('1751462833', 'v1=6b3a0c7e4f9d2b5a8c1e6f3d0b7a4c9e2f5d8b1a6c3e0f7d4b9a2c5e8f1d6b30'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-25',
    eventId: 'evt_7018',
    endpointId: 'ep-legacy',
    eventType: 'order.created',
    clock: '13:45:39',
    attempts: exhaustedRun(25, '13:45:39', ['timeout', 'timeout', '503', '503', '503']),
    payload: orderPayload('evt_7018', 'order.created', 'ord_88131', 9200, 'cus_3418', [
      {sku: 'SKU-DELTA-10', qty: 1, priceCents: 9200},
    ]),
    response: LEGACY_503_RESPONSE,
    signature: sig('1751462739', 'v1=2d5b8a1c6e3f0d9b4a7c2e5f8d1b6a3c0e7f4d1b8a5c2e9f6d3b0a7c4e1f8d52'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-26',
    eventId: 'evt_7014',
    endpointId: 'ep-orders',
    eventType: 'order.created',
    clock: '13:44:02',
    attempts: [okAttempt(26, 1, '13:44:02', 169)],
    payload: orderPayload('evt_7014', 'order.created', 'ord_88127', 41100, 'cus_2891', [
      {sku: 'SKU-CANYON-04', qty: 1, priceCents: 18900},
      {sku: 'SKU-SUMMIT-03', qty: 1, priceCents: 22200},
    ]),
    response: okResponse('req_t8p194'),
    signature: sig('1751462642', 'v1=8f1d6b3a0c5e9f2d7b4a1c8e5f0d3b6a9c2e7f4d1b0a5c8e3f6d9b2a7c4e0f11'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-27',
    eventId: 'evt_7011',
    endpointId: 'ep-billing',
    eventType: 'refund.created',
    clock: '13:42:27',
    attempts: [okAttempt(27, 1, '13:42:27', 258)],
    payload: refundPayload('evt_7011', 'ref_1201', 'ch_65994', 4900, 'duplicate'),
    response: okResponse('req_u2q073'),
    signature: sig('1751462547', 'v1=4a7c2e9f6d1b8a3c0e5f2d7b4a9c6e1f8d5b0a3c7e4f9d2b5a8c1e6f3d0b7a92'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-28',
    eventId: 'evt_7007',
    endpointId: 'ep-orders',
    eventType: 'customer.updated',
    clock: '13:40:51',
    attempts: [okAttempt(28, 1, '13:40:51', 147)],
    payload: customerPayload('evt_7007', 'cus_1042', 'Foglift Coffee Co.', 'pro', [
      'plan',
    ]),
    response: okResponse('req_v6r381'),
    signature: sig('1751462451', 'v1=0c5e9f4d2b7a1c6e3f8d0b5a9c2e7f4d1b8a6c3e0f5d9b2a7c4e1f8d6b3a0c53'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-29',
    eventId: 'evt_7003',
    endpointId: 'ep-legacy',
    eventType: 'order.fulfilled',
    clock: '13:39:18',
    attempts: exhaustedRun(29, '13:39:18', ['503', '503', 'timeout', 'timeout', '503']),
    payload: orderPayload('evt_7003', 'order.fulfilled', 'ord_88119', 12900, 'cus_2214', [
      {sku: 'SKU-TRAIL-01', qty: 1, priceCents: 12900},
    ]),
    response: LEGACY_503_RESPONSE,
    signature: sig('1751462358', 'v1=7d4b0a9c6e2f5d8b1a4c7e0f3d9b6a2c5e8f1d4b7a0c3e9f6d2b5a8c1e4f0d76'),
    sigStatus: 'verified',
  },
  {
    id: 'dlv-30',
    eventId: 'evt_6999',
    endpointId: 'ep-orders',
    eventType: 'order.created',
    clock: '13:37:44',
    attempts: [okAttempt(30, 1, '13:37:44', 183)],
    payload: orderPayload('evt_6999', 'order.created', 'ord_88112', 6200, 'cus_0451', [
      {sku: 'SKU-CREEK-12', qty: 1, priceCents: 3700},
      {sku: 'SKU-STRAP-11', qty: 1, priceCents: 2500},
    ]),
    response: okResponse('req_w9s640'),
    signature: sig('1751462264', 'v1=3e8f2d5b9a6c1e4f7d0b3a8c5e2f9d6b1a4c7e0f5d8b2a9c6e3f0d7b4a1c8e54'),
    sigStatus: 'verified',
  },
];

// Replay clocks: frozen session start, fixed 47-second steps per replay.
const REPLAY_CLOCK_START = 14 * 3600 + 26 * 60 + 5; // 14:26:05
const REPLAY_CLOCK_STEP = 47;
const REPLAY_ANIMATION_MS = 900;
const REPLAY_DURATION_MS = 142;

// ============= HELPERS =============

const STATUS_CLASSES: StatusClass[] = ['2xx', '4xx', '5xx', 'timeout'];

const STATUS_BADGE_VARIANT: Record<
  StatusClass,
  'success' | 'warning' | 'error'
> = {
  '2xx': 'success',
  '4xx': 'warning',
  '5xx': 'error',
  timeout: 'error',
};

const STATUS_DOT_VARIANT: Record<
  AttemptOutcome,
  'success' | 'warning' | 'error' | 'neutral'
> = {
  '2xx': 'success',
  '4xx': 'warning',
  '5xx': 'error',
  timeout: 'error',
  pending: 'neutral',
};

function endpointOf(id: EndpointId): EndpointFixture {
  return ENDPOINTS.find(endpoint => endpoint.id === id) ?? ENDPOINTS[0];
}

function deliveryOf(id: string): Delivery {
  return DELIVERIES.find(delivery => delivery.id === id) ?? DELIVERIES[0];
}

/** Delivery outcome = outcome of the newest attempt (pending wins). */
function outcomeOf(attempts: Attempt[]): AttemptOutcome {
  const last = attempts[attempts.length - 1];
  return last === undefined ? 'pending' : last.outcome;
}

function outcomeLabel(attempts: Attempt[]): string {
  const last = attempts[attempts.length - 1];
  if (last === undefined || last.outcome === 'pending') {
    return 'Pending';
  }
  if (last.outcome === 'timeout') {
    return 'Timeout';
  }
  return `HTTP ${last.httpStatus ?? '—'}`;
}

function healthVariant(pct: number): 'success' | 'warning' | 'error' {
  if (pct >= 95) {
    return 'success';
  }
  if (pct >= 80) {
    return 'warning';
  }
  return 'error';
}

/** Backoff-wait preview strings for the settings drawer. */
function backoffPreview(mode: BackoffMode, maxAttempts: number): string {
  const table = mode === 'exponential' ? EXP_BACKOFFS : LINEAR_BACKOFFS;
  const waits: string[] = [];
  for (let index = 0; index < maxAttempts - 1; index += 1) {
    const seconds =
      mode === 'exponential'
        ? table[Math.min(index, table.length - 1)] *
          (index >= table.length ? 4 ** (index - table.length + 1) : 1)
        : 30 * (index + 1);
    waits.push(formatWait(seconds));
  }
  return waits.join(' → ');
}

function hostOf(url: string): string {
  return url.replace(/^https?:\/\//, '').split('/')[0];
}

// ============= JSON TREE =============
// Collapsible payload tree. Toggles are real buttons (aria-expanded) and
// every named key is a select button — selecting a key surfaces its
// JSONPath in the bar above the tree, where a copy affordance lives. No
// hover-only reveals; touch layouts get >=40px targets.

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
  selectedPath: string | null;
  isCompact: boolean;
  onToggle: (path: string) => void;
  onSelectPath: (path: string) => void;
}

function JsonNode({
  value,
  name,
  path,
  depth,
  isLast,
  collapsedPaths,
  selectedPath,
  isCompact,
  onToggle,
  onSelectPath,
}: JsonNodeProps) {
  const spacerStyle = isCompact
    ? styles.jsonToggleSpacerCompact
    : styles.jsonToggleSpacer;
  const indentStyle: CSSProperties = {paddingLeft: depth * 14};
  const lineStyle =
    selectedPath === path ? styles.jsonLineSelected : styles.jsonLine;
  const comma = isLast ? '' : ',';
  const keyNode =
    name !== null ? (
      <>
        <button
          type="button"
          aria-label={`Select path ${path}`}
          style={isCompact ? styles.jsonKeyButtonCompact : styles.jsonKeyButton}
          onClick={() => onSelectPath(path)}>
          &quot;{name}&quot;
        </button>
        <span>: </span>
      </>
    ) : null;

  if (value === null || typeof value !== 'object') {
    return (
      <div style={{...lineStyle, ...indentStyle}}>
        <span style={spacerStyle} aria-hidden />
        {keyNode}
        <span>
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

  return (
    <div>
      <div style={{...lineStyle, ...indentStyle}}>
        <button
          type="button"
          aria-expanded={!isCollapsed}
          aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${
            name ?? 'payload root'
          }`}
          style={isCompact ? styles.jsonToggleCompact : styles.jsonToggle}
          onClick={() => onToggle(path)}>
          {isCollapsed ? '▸' : '▾'}
        </button>
        {keyNode}
        <span>
          {open}
          {isCollapsed && (
            <span style={{color: CODE.dim}}>
              {' … '}
              {summary} {close}
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
                selectedPath={selectedPath}
                isCompact={isCompact}
                onToggle={onToggle}
                onSelectPath={onSelectPath}
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

// ============= PAGE =============

type PanelMode = 'detail' | 'settings';
type DetailTab = 'payload' | 'response' | 'signature' | 'attempts';
type ScopeId = 'all' | EndpointId;

function initialSettings(): Record<EndpointId, EndpointSettings> {
  const settings = {} as Record<EndpointId, EndpointSettings>;
  for (const endpoint of ENDPOINTS) {
    settings[endpoint.id] = {
      maxAttempts: endpoint.maxAttempts,
      backoffMode: endpoint.backoffMode,
      subscriptions: [...endpoint.subscriptions],
    };
  }
  return settings;
}

export default function WebhookDeliveryDebuggerTemplate() {
  const toast = useToast();

  const [scopeId, setScopeId] = useState<ScopeId>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StatusClass>('all');
  const [typeFilter, setTypeFilter] = useState<EventType[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(
    DELIVERIES[0].id,
  );
  const [detailTab, setDetailTab] = useState<DetailTab>('payload');
  const [collapsedPaths, setCollapsedPaths] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  // Replay attempts appended per delivery id (pending, then resolved).
  const [replayAttempts, setReplayAttempts] = useState<
    Record<string, Attempt[]>
  >({});
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [replayCount, setReplayCount] = useState(0);
  // Endpoint settings drawer shares the end panel with the detail pane.
  const [panelMode, setPanelMode] = useState<PanelMode>('detail');
  const [settingsEndpointId, setSettingsEndpointId] =
    useState<EndpointId>('ep-legacy');
  const [endpointSettings, setEndpointSettings] = useState<
    Record<EndpointId, EndpointSettings>
  >(initialSettings);
  const [announcement, setAnnouncement] = useState('');
  // Single-pane mode below 640px: one surface at a time.
  const [mobileView, setMobileView] = useState('feed');

  const replayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (replayTimer.current !== null) {
        clearTimeout(replayTimer.current);
      }
    },
    [],
  );

  const isSinglePane = useMediaQuery('(max-width: 640px)');
  const isNarrow = useMediaQuery('(max-width: 1240px)');

  // ---- derived state ----

  const attemptsOf = (delivery: Delivery): Attempt[] => [
    ...delivery.attempts,
    ...(replayAttempts[delivery.id] ?? []),
  ];

  const selectedDelivery = deliveryOf(selectedDeliveryId);
  const selectedAttempts = attemptsOf(selectedDelivery);
  const selectedOutcome = outcomeOf(selectedAttempts);
  const selectedEndpoint = endpointOf(selectedDelivery.endpointId);
  const settingsEndpoint = endpointOf(settingsEndpointId);
  const settingsDraft = endpointSettings[settingsEndpointId];

  // Endpoint health: share of its deliveries whose latest attempt is 2xx.
  const healthByEndpoint = useMemo(() => {
    const health: Record<EndpointId, number> = {
      'ep-orders': 0,
      'ep-billing': 0,
      'ep-analytics': 0,
      'ep-legacy': 0,
    };
    for (const endpoint of ENDPOINTS) {
      const rows = DELIVERIES.filter(
        delivery => delivery.endpointId === endpoint.id,
      );
      const delivered = rows.filter(
        delivery => outcomeOf(attemptsOf(delivery)) === '2xx',
      ).length;
      health[endpoint.id] =
        rows.length === 0 ? 100 : Math.round((delivered / rows.length) * 100);
    }
    return health;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayAttempts]);

  const deliveredCount = DELIVERIES.filter(
    delivery => outcomeOf(attemptsOf(delivery)) === '2xx',
  ).length;

  // Available event-type chips mirror the scoped endpoints' subscriptions.
  const scopedEndpoints =
    scopeId === 'all'
      ? ENDPOINTS
      : ENDPOINTS.filter(endpoint => endpoint.id === scopeId);
  const availableTypes = EVENT_TYPES.filter(type =>
    scopedEndpoints.some(endpoint =>
      endpointSettings[endpoint.id].subscriptions.includes(type),
    ),
  );
  const activeTypes = typeFilter.filter(type => availableTypes.includes(type));

  const scopedDeliveries = DELIVERIES.filter(
    delivery => scopeId === 'all' || delivery.endpointId === scopeId,
  );
  const typedDeliveries = scopedDeliveries.filter(
    delivery =>
      activeTypes.length === 0 || activeTypes.includes(delivery.eventType),
  );
  const feedDeliveries = typedDeliveries.filter(
    delivery =>
      statusFilter === 'all' ||
      outcomeOf(attemptsOf(delivery)) === statusFilter,
  );

  const statusCounts = useMemo(() => {
    const counts: Record<StatusClass, number> = {
      '2xx': 0,
      '4xx': 0,
      '5xx': 0,
      timeout: 0,
    };
    for (const delivery of typedDeliveries) {
      const outcome = outcomeOf(attemptsOf(delivery));
      if (outcome !== 'pending') {
        counts[outcome] += 1;
      }
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedDeliveries, replayAttempts]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const delivery of scopedDeliveries) {
      counts[delivery.eventType] = (counts[delivery.eventType] ?? 0) + 1;
    }
    return counts;
  }, [scopedDeliveries]);

  // ---- handlers ----

  const selectScope = (next: ScopeId) => {
    setScopeId(next);
    setAnnouncement(
      next === 'all'
        ? 'Showing deliveries for all endpoints'
        : `Showing deliveries for ${endpointOf(next).name}`,
    );
    if (isSinglePane) {
      setMobileView('feed');
    }
  };

  const selectDelivery = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setCollapsedPaths({});
    setSelectedPath(null);
    setPanelMode('detail');
    if (isSinglePane) {
      setMobileView('detail');
    }
  };

  const toggleType = (type: EventType) => {
    setTypeFilter(prev =>
      prev.includes(type)
        ? prev.filter(entry => entry !== type)
        : [...prev, type],
    );
  };

  const toggleJsonPath = (path: string) => {
    setCollapsedPaths(prev => ({...prev, [path]: !prev[path]}));
  };

  const copySelectedPath = () => {
    if (selectedPath === null) {
      return;
    }
    try {
      void navigator.clipboard?.writeText(selectedPath);
    } catch {
      // Clipboard access is best-effort; the toast still confirms the path.
    }
    toast({body: `Copied ${selectedPath}`, isAutoHide: true});
    setAnnouncement(`Copied payload path ${selectedPath}`);
  };

  const replayDelivery = (deliveryId: string) => {
    if (replayingId !== null) {
      return;
    }
    const delivery = deliveryOf(deliveryId);
    const attemptNumber = attemptsOf(delivery).length + 1;
    const pendingAttempt: Attempt = {
      id: `${deliveryId}-replay-${attemptNumber}`,
      number: attemptNumber,
      clock: '—',
      outcome: 'pending',
      httpStatus: null,
      durationMs: null,
      backoffBeforeS: null,
      isReplay: true,
    };
    setReplayingId(deliveryId);
    setReplayAttempts(prev => ({
      ...prev,
      [deliveryId]: [...(prev[deliveryId] ?? []), pendingAttempt],
    }));
    setAnnouncement(`Replay enqueued for ${delivery.eventId}`);
    const resolvedClock = formatClock(
      REPLAY_CLOCK_START + replayCount * REPLAY_CLOCK_STEP,
    );
    if (replayTimer.current !== null) {
      clearTimeout(replayTimer.current);
    }
    replayTimer.current = setTimeout(() => {
      setReplayAttempts(prev => ({
        ...prev,
        [deliveryId]: (prev[deliveryId] ?? []).map(attempt =>
          attempt.id === pendingAttempt.id
            ? {
                ...attempt,
                clock: resolvedClock,
                outcome: '2xx' as const,
                httpStatus: 200,
                durationMs: REPLAY_DURATION_MS,
              }
            : attempt,
        ),
      }));
      setReplayCount(prev => prev + 1);
      setReplayingId(null);
      toast({
        body: `Replay delivered — 200 OK in ${REPLAY_DURATION_MS} ms (attempt ${attemptNumber})`,
        isAutoHide: true,
      });
      setAnnouncement(
        `Replay for ${delivery.eventId} succeeded with HTTP 200`,
      );
    }, REPLAY_ANIMATION_MS);
  };

  const openSettings = (endpointId: EndpointId) => {
    setSettingsEndpointId(endpointId);
    setPanelMode('settings');
    if (isSinglePane) {
      setMobileView('detail');
    }
  };

  const closeSettings = () => {
    setPanelMode('detail');
  };

  const updateSettings = (patch: Partial<EndpointSettings>) => {
    setEndpointSettings(prev => ({
      ...prev,
      [settingsEndpointId]: {...prev[settingsEndpointId], ...patch},
    }));
  };

  const toggleSubscription = (type: EventType, enabled: boolean) => {
    const current = endpointSettings[settingsEndpointId].subscriptions;
    updateSettings({
      subscriptions: enabled
        ? [...current, type]
        : current.filter(entry => entry !== type),
    });
    setAnnouncement(
      `${type} ${enabled ? 'subscribed' : 'unsubscribed'} for ${
        settingsEndpoint.name
      } — feed filter chips updated`,
    );
  };

  // ---- endpoints rail ----

  const endpointsRail = (
    <div style={styles.pane}>
      <div style={styles.railHeader}>
        <Text type="label" size="sm" color="secondary">
          Registered endpoints
        </Text>
      </div>
      <div style={styles.paneScroll}>
        <List density="compact" hasDividers={false}>
          <ListItem
            label="All endpoints"
            description={`${DELIVERIES.length} deliveries · ${deliveredCount} delivered`}
            isSelected={scopeId === 'all'}
            onClick={() => selectScope('all')}
          />
          {ENDPOINTS.map(endpoint => {
            const pct = healthByEndpoint[endpoint.id];
            const subCount = endpointSettings[endpoint.id].subscriptions.length;
            return (
              <ListItem
                key={endpoint.id}
                label={endpoint.name}
                description={`${hostOf(endpoint.url)} · ${subCount} event type${
                  subCount === 1 ? '' : 's'
                }`}
                isSelected={scopeId === endpoint.id}
                onClick={() => selectScope(endpoint.id)}
                endContent={
                  <Badge label={`${pct}%`} variant={healthVariant(pct)} />
                }
              />
            );
          })}
        </List>
      </div>
      <Divider />
      <div style={styles.railFootnote}>
        <Text type="supporting" color="secondary" maxLines={2}>
          Health = deliveries whose latest attempt returned 2xx. Replays
          recompute it live.
        </Text>
      </div>
    </div>
  );

  // ---- delivery feed ----

  const scopeEndpoint = scopeId === 'all' ? null : endpointOf(scopeId);

  const feedPane = (
    <div style={styles.pane}>
      <div style={styles.filterBar}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <StackItem size="fill" style={styles.headerTitle}>
              <HStack gap={2} vAlign="center">
                <Heading level={4} accessibilityLevel={2} maxLines={1}>
                  {scopeEndpoint === null
                    ? 'All deliveries'
                    : scopeEndpoint.name}
                </Heading>
                <Badge label={`${feedDeliveries.length}`} variant="neutral" />
              </HStack>
            </StackItem>
            {scopeEndpoint !== null && (
              <IconButton
                label={`Open settings for ${scopeEndpoint.name}`}
                tooltip="Endpoint settings"
                icon={<Icon icon={Settings2Icon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                style={isSinglePane ? styles.iconTapTarget : undefined}
                onClick={() => openSettings(scopeEndpoint.id)}
              />
            )}
          </HStack>
          <SegmentedControl
            label="Response status filter"
            value={statusFilter}
            onChange={value => setStatusFilter(value as 'all' | StatusClass)}
            size="sm"
            style={isSinglePane ? styles.segmentedTapTarget : undefined}>
            <SegmentedControlItem
              value="all"
              label={`All (${typedDeliveries.length})`}
            />
            {STATUS_CLASSES.map(statusClass => (
              <SegmentedControlItem
                key={statusClass}
                value={statusClass}
                label={`${statusClass} (${statusCounts[statusClass]})`}
              />
            ))}
          </SegmentedControl>
          <div style={styles.chipsRow} role="group" aria-label="Event type filters">
            {availableTypes.map(type => {
              const isActive = activeTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={isActive}
                  style={{
                    ...styles.chip,
                    ...(isActive ? styles.chipActive : undefined),
                    ...(isSinglePane ? styles.chipCompact : undefined),
                  }}
                  onClick={() => toggleType(type)}>
                  {type}
                  <span aria-hidden>({typeCounts[type] ?? 0})</span>
                </button>
              );
            })}
            {activeTypes.length > 0 && (
              <Button
                label="Clear types"
                variant="ghost"
                size="sm"
                style={isSinglePane ? styles.buttonTapTarget : undefined}
                onClick={() => setTypeFilter([])}
              />
            )}
          </div>
        </VStack>
      </div>
      <Divider />
      <div style={styles.paneScroll}>
        {feedDeliveries.length === 0 ? (
          <EmptyState
            title="No deliveries match"
            description="Loosen the status or event-type filters — unsubscribed event types also drop their filter chips."
          />
        ) : (
          <List density="compact" hasDividers={false}>
            {feedDeliveries.map(delivery => {
              const attempts = attemptsOf(delivery);
              const outcome = outcomeOf(attempts);
              const isPending = outcome === 'pending';
              const endpoint = endpointOf(delivery.endpointId);
              const exhausted =
                outcome !== '2xx' &&
                !isPending &&
                delivery.attempts.length >=
                  endpointSettings[endpoint.id].maxAttempts;
              return (
                <ListItem
                  key={delivery.id}
                  isSelected={delivery.id === selectedDeliveryId}
                  onClick={() => selectDelivery(delivery.id)}
                  label={
                    <HStack gap={2} vAlign="center">
                      <Text type="body" maxLines={1}>
                        {delivery.eventType}
                      </Text>
                      <span style={styles.eventId}>{delivery.eventId}</span>
                    </HStack>
                  }
                  description={`${delivery.clock} UTC · ${
                    scopeId === 'all' ? `${endpoint.name} · ` : ''
                  }${attempts.length} attempt${attempts.length === 1 ? '' : 's'}${
                    exhausted ? ' · retries exhausted' : ''
                  }`}
                  endContent={
                    isPending ? (
                      <Spinner size="sm" label="Replay in flight" />
                    ) : (
                      <Badge
                        label={outcomeLabel(attempts)}
                        variant={
                          STATUS_BADGE_VARIANT[outcome as StatusClass]
                        }
                      />
                    )
                  }
                />
              );
            })}
          </List>
        )}
      </div>
    </div>
  );

  // ---- detail pane ----

  const lastResolved = [...selectedAttempts]
    .reverse()
    .find(attempt => attempt.outcome !== 'pending');
  const responseFixture =
    lastResolved?.isReplay === true && lastResolved.outcome === '2xx'
      ? REPLAY_RESPONSE
      : selectedDelivery.response;
  const isSelectedExhausted =
    selectedOutcome !== '2xx' &&
    selectedOutcome !== 'pending' &&
    selectedDelivery.attempts.length >=
      endpointSettings[selectedEndpoint.id].maxAttempts;

  const payloadTab = (
    <div style={styles.detailSection}>
      <VStack gap={2}>
        <div style={styles.pathBar}>
          <StackItem size="fill">
            <span style={styles.pathText}>
              {selectedPath ?? 'Select a key in the tree to copy its path'}
            </span>
          </StackItem>
          <IconButton
            label={
              selectedPath === null
                ? 'Copy path (select a key first)'
                : `Copy path ${selectedPath}`
            }
            tooltip="Copy JSON path"
            icon={<Icon icon={CopyIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            isDisabled={selectedPath === null}
            style={isSinglePane ? styles.iconTapTarget : undefined}
            onClick={copySelectedPath}
          />
        </div>
        <div
          role="region"
          aria-label="Request payload"
          tabIndex={0}
          style={styles.codeBlock}>
          <JsonNode
            value={selectedDelivery.payload}
            name={null}
            path="$"
            depth={0}
            isLast
            collapsedPaths={collapsedPaths}
            selectedPath={selectedPath}
            isCompact={isSinglePane}
            onToggle={toggleJsonPath}
            onSelectPath={setSelectedPath}
          />
        </div>
      </VStack>
    </div>
  );

  const responseTab = (
    <div style={styles.detailSection}>
      {responseFixture === null ? (
        <EmptyState
          title="No response captured"
          description="The receiver never answered — the connection timed out after 10s on every attempt. Replay to try again."
        />
      ) : (
        <VStack gap={3}>
          <VStack gap={1}>
            <Text type="label" size="sm" color="secondary">
              Response headers
            </Text>
            <MetadataList
              columns="single"
              label={{position: 'start', width: 140}}>
              {responseFixture.headers.map(header => (
                <MetadataListItem key={header.key} label={header.key}>
                  <span style={styles.monoSmall}>{header.value}</span>
                </MetadataListItem>
              ))}
            </MetadataList>
          </VStack>
          <VStack gap={1}>
            <Text type="label" size="sm" color="secondary">
              Response body
            </Text>
            <div
              role="region"
              aria-label="Response body"
              tabIndex={0}
              style={styles.codeBlock}>
              <pre style={styles.rawBody}>{responseFixture.body}</pre>
            </div>
          </VStack>
        </VStack>
      )}
    </div>
  );

  const signatureTab = (
    <div style={styles.detailSection}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon
            icon={
              selectedDelivery.sigStatus === 'verified'
                ? ShieldCheckIcon
                : ShieldAlertIcon
            }
            size="sm"
            color="secondary"
          />
          <Badge
            label={
              selectedDelivery.sigStatus === 'verified'
                ? 'Signature verified'
                : 'Rejected by receiver'
            }
            variant={
              selectedDelivery.sigStatus === 'verified' ? 'success' : 'error'
            }
          />
        </HStack>
        <MetadataList columns="single" label={{position: 'start', width: 110}}>
          <MetadataListItem label="Scheme">
            <Text type="body">HMAC-SHA256 (v1)</Text>
          </MetadataListItem>
          <MetadataListItem label="Signing key">
            <span style={styles.monoSmall}>
              {selectedDelivery.signature.keyId}
            </span>
          </MetadataListItem>
          <MetadataListItem label="Signed at">
            <span style={styles.monoSmall}>
              t={selectedDelivery.signature.timestamp}
            </span>
          </MetadataListItem>
          <MetadataListItem label="Digest">
            <span style={styles.sigDigest}>
              {selectedDelivery.signature.digest}
            </span>
          </MetadataListItem>
        </MetadataList>
        <Text type="supporting" color="secondary">
          The receiver recomputes the digest over `t.payload` with the shared
          secret and compares it in constant time.
          {selectedDelivery.sigStatus === 'mismatch' &&
            ' This delivery was signed with a rotated key the receiver no longer trusts.'}
        </Text>
      </VStack>
    </div>
  );

  const attemptsTab = (
    <div style={styles.detailSection}>
      <VStack gap={2}>
        {isSelectedExhausted && (
          <Badge
            label={`Retries exhausted (${selectedDelivery.attempts.length}/${
              endpointSettings[selectedEndpoint.id].maxAttempts
            })`}
            variant="error"
          />
        )}
        {selectedAttempts.map((attempt, index) => (
          <VStack key={attempt.id} gap={2}>
            {attempt.backoffBeforeS !== null && index > 0 && (
              <div style={styles.timelineWait}>
                <Text type="supporting" color="secondary">
                  waited {formatWait(attempt.backoffBeforeS)} (
                  {endpointSettings[selectedEndpoint.id].backoffMode} backoff)
                </Text>
              </div>
            )}
            {attempt.isReplay === true && index > 0 && (
              <div style={styles.timelineWait}>
                <Text type="supporting" color="secondary">
                  manual replay — no backoff wait
                </Text>
              </div>
            )}
            <div style={styles.timelineRow}>
              <StatusDot
                variant={STATUS_DOT_VARIANT[attempt.outcome]}
                label={`Attempt ${attempt.number}: ${attempt.outcome}`}
                isPulsing={attempt.outcome === 'pending'}
              />
              <StackItem size="fill">
                <VStack gap={0}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Text type="body">Attempt {attempt.number}</Text>
                    {attempt.isReplay === true && (
                      <Badge label="replay" variant="info" />
                    )}
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {attempt.outcome === 'pending'
                      ? 'in flight…'
                      : `${attempt.clock} UTC · ${
                          attempt.outcome === 'timeout'
                            ? 'timed out'
                            : `HTTP ${attempt.httpStatus ?? '—'}`
                        } · ${attempt.durationMs ?? 0} ms`}
                  </Text>
                </VStack>
              </StackItem>
            </div>
          </VStack>
        ))}
      </VStack>
    </div>
  );

  const detailPane = (
    <div style={styles.pane}>
      <div style={styles.detailHeader}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <StackItem size="fill" style={styles.headerTitle}>
              <VStack gap={0}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Heading level={4} accessibilityLevel={2} maxLines={1}>
                    {selectedDelivery.eventType}
                  </Heading>
                  {selectedOutcome === 'pending' ? (
                    <Spinner size="sm" label="Replay in flight" />
                  ) : (
                    <Badge
                      label={outcomeLabel(selectedAttempts)}
                      variant={
                        STATUS_BADGE_VARIANT[selectedOutcome as StatusClass]
                      }
                    />
                  )}
                </HStack>
                <Text type="supporting" color="secondary" maxLines={1}>
                  <span style={styles.monoSmall}>
                    {selectedDelivery.eventId}
                  </span>{' '}
                  · {selectedDelivery.clock} UTC
                </Text>
              </VStack>
            </StackItem>
            <IconButton
              label={`Open settings for ${selectedEndpoint.name}`}
              tooltip="Endpoint settings"
              icon={<Icon icon={Settings2Icon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              style={isSinglePane ? styles.iconTapTarget : undefined}
              onClick={() => openSettings(selectedEndpoint.id)}
            />
          </HStack>
          <Text type="supporting" color="secondary" maxLines={1}>
            {selectedEndpoint.name} ·{' '}
            <span style={styles.monoSmall}>{selectedEndpoint.url}</span>
          </Text>
          <HStack gap={2} vAlign="center">
            <Button
              label={
                replayingId === selectedDelivery.id
                  ? 'Replaying…'
                  : 'Replay delivery'
              }
              variant={selectedOutcome === '2xx' ? 'secondary' : 'primary'}
              size="sm"
              icon={<Icon icon={RotateCwIcon} size="sm" />}
              isDisabled={replayingId !== null}
              style={isSinglePane ? styles.buttonTapTarget : undefined}
              onClick={() => replayDelivery(selectedDelivery.id)}
            />
            <Text type="supporting" color="secondary">
              enqueues attempt {selectedAttempts.length + 1}
            </Text>
          </HStack>
        </VStack>
      </div>
      <div style={styles.detailTabs}>
        <TabList
          value={detailTab}
          onChange={value => setDetailTab(value as DetailTab)}
          size="sm"
          style={isSinglePane ? styles.tabsTapTarget : undefined}>
          <Tab value="payload" label="Payload" />
          <Tab value="response" label="Response" />
          <Tab value="signature" label="Signature" />
          <Tab
            value="attempts"
            label="Attempts"
            endContent={<Badge label={String(selectedAttempts.length)} />}
          />
        </TabList>
      </div>
      <div style={styles.paneScroll}>
        {detailTab === 'payload' && payloadTab}
        {detailTab === 'response' && responseTab}
        {detailTab === 'signature' && signatureTab}
        {detailTab === 'attempts' && attemptsTab}
      </div>
    </div>
  );

  // ---- endpoint settings drawer (shares the end panel / detail surface) ----

  const settingsDrawer = (
    <div style={styles.pane}>
      <div style={styles.detailHeader}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={styles.headerTitle}>
            <VStack gap={0}>
              <Heading level={4} accessibilityLevel={2} maxLines={1}>
                Endpoint settings
              </Heading>
              <Text type="supporting" color="secondary" maxLines={1}>
                {settingsEndpoint.name}
              </Text>
            </VStack>
          </StackItem>
          <IconButton
            label="Close endpoint settings"
            tooltip="Close"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            style={isSinglePane ? styles.iconTapTarget : undefined}
            onClick={closeSettings}
          />
        </HStack>
      </div>
      <Divider />
      <div style={styles.paneScrollPadded}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Text type="label" size="sm" color="secondary">
              Destination
            </Text>
            <span style={styles.monoSmall}>{settingsEndpoint.url}</span>
            <HStack gap={2} vAlign="center">
              <Badge
                label={`${healthByEndpoint[settingsEndpointId]}% healthy`}
                variant={healthVariant(healthByEndpoint[settingsEndpointId])}
              />
              <Text type="supporting" color="secondary">
                over{' '}
                {
                  DELIVERIES.filter(
                    delivery => delivery.endpointId === settingsEndpointId,
                  ).length
                }{' '}
                deliveries
              </Text>
            </HStack>
          </VStack>
          <Divider />
          <VStack gap={2}>
            <Text type="label" size="sm" color="secondary">
              Retry policy
            </Text>
            <Selector
              label="Max attempts"
              size="sm"
              options={[
                {value: '3', label: '3 attempts'},
                {value: '5', label: '5 attempts'},
                {value: '8', label: '8 attempts'},
              ]}
              value={String(settingsDraft.maxAttempts)}
              onChange={value => updateSettings({maxAttempts: Number(value)})}
              style={isSinglePane ? styles.selectorTapTarget : undefined}
            />
            <SegmentedControl
              label="Backoff mode"
              value={settingsDraft.backoffMode}
              onChange={value =>
                updateSettings({backoffMode: value as BackoffMode})
              }
              size="sm"
              style={isSinglePane ? styles.segmentedTapTarget : undefined}>
              <SegmentedControlItem value="linear" label="Linear" />
              <SegmentedControlItem value="exponential" label="Exponential" />
            </SegmentedControl>
            <Text type="supporting" color="secondary">
              Waits between attempts:{' '}
              {backoffPreview(
                settingsDraft.backoffMode,
                settingsDraft.maxAttempts,
              )}
            </Text>
          </VStack>
          <Divider />
          <VStack gap={2}>
            <Text type="label" size="sm" color="secondary">
              Event subscriptions
            </Text>
            <Text type="supporting" color="secondary">
              Toggling a type updates the feed&apos;s filter chips immediately.
            </Text>
            {EVENT_TYPES.map(type => (
              <Switch
                key={type}
                label={type}
                value={settingsDraft.subscriptions.includes(type)}
                onChange={checked => toggleSubscription(type, checked)}
              />
            ))}
          </VStack>
        </VStack>
      </div>
    </div>
  );

  const endPanelContent = panelMode === 'settings' ? settingsDrawer : detailPane;

  // ---- frame ----

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill" style={styles.headerTitle}>
              <HStack gap={2} vAlign="center">
                <Icon icon={WebhookIcon} size="md" color="secondary" />
                <Heading level={1} maxLines={1}>
                  Webhook Deliveries
                </Heading>
                {!isSinglePane && (
                  <Badge
                    label={`${deliveredCount}/${DELIVERIES.length} delivered`}
                    variant={
                      deliveredCount === DELIVERIES.length
                        ? 'success'
                        : 'neutral'
                    }
                  />
                )}
              </HStack>
            </StackItem>
            {isSinglePane && (
              <SegmentedControl
                label="Console view"
                value={mobileView}
                onChange={setMobileView}
                size="sm"
                style={styles.segmentedTapTarget}>
                <SegmentedControlItem label="Endpoints" value="endpoints" />
                <SegmentedControlItem label="Feed" value="feed" />
                <SegmentedControlItem label="Detail" value="detail" />
              </SegmentedControl>
            )}
          </HStack>
        </LayoutHeader>
      }
      start={
        !isSinglePane ? (
          <LayoutPanel
            hasDivider
            width={isNarrow ? 230 : 260}
            padding={0}
            label="Endpoints">
            {endpointsRail}
          </LayoutPanel>
        ) : undefined
      }
      end={
        !isSinglePane ? (
          <LayoutPanel
            hasDivider
            width={isNarrow ? 360 : 440}
            padding={0}
            label={
              panelMode === 'settings' ? 'Endpoint settings' : 'Delivery detail'
            }>
            {endPanelContent}
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {isSinglePane ? (
            <Stack direction="vertical" style={{height: '100%', minHeight: 0}}>
              <StackItem size="fill" style={{minHeight: 0}}>
                {mobileView === 'endpoints'
                  ? endpointsRail
                  : mobileView === 'detail'
                    ? endPanelContent
                    : feedPane}
              </StackItem>
            </Stack>
          ) : (
            feedPane
          )}
        </LayoutContent>
      }
    />
  );
}
