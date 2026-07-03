// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one distributed trace for
 *   POST /api/v1/checkout captured 2026-07-02T14:37:12.408Z — 21 spans
 *   across 5 services with fixed start offsets and durations that nest
 *   cleanly, one failed PSP authorization span carrying an error stack and
 *   a successful retry child; endpoint latency percentiles and a 5-node
 *   service topology derived from the same span set)
 * @output Spanline APM distributed-trace view: a trace header with the
 *   mono trace-id chip (copy affordance), total duration, service count,
 *   span count, and an error badge; a p50/p95/p99 endpoint-latency strip
 *   with this trace's duration marked on the same scale; the span
 *   waterfall — depth-indented rows with collapse chevrons, service color
 *   keys, right-aligned mono durations, and proportional duration bars on
 *   a shared ms-per-percent scale over 100 ms gridlines, the failed
 *   psp.authorize span painted error-red with its retry child beneath;
 *   an end panel showing the selected span's service/kind/status chips,
 *   timing breakdown (start offset, duration, % of trace, self vs child
 *   time with a stacked bar), a key/value tags table, the error stack
 *   excerpt in a CodeBlock for the failed span, and a service-map mini
 *   graph whose 5 nodes and latency edges are computed from the spans.
 * @position Page template; emitted by `astryx template apm-trace-waterfall`
 *
 * Frame: a 100dvh root div gives Layout height="fill" a definite height in
 * auto-height hosts. LayoutHeader carries the Spanline wordmark, endpoint
 * + trace-id chips, and the duration / services / spans / error readouts.
 * LayoutContent owns the latency strip (pinned) and the waterfall (time
 * axis pinned above rows that scroll vertically). The span inspector +
 * service map share a fixed-width end LayoutPanel that scrolls
 * independently via the sticky idiom.
 *
 * Responsive contract:
 * - >1240px: inspector panel 380px; waterfall label gutter 300px with a
 *   per-row service chip beside the span name.
 * - 901-1240px: inspector panel 320px; label gutter 220px; the per-row
 *   service chip hides (color key + name remain).
 * - <=900px: the end panel unmounts and the inspector + service map render
 *   as a stacked section below the waterfall in the same scroll; label
 *   gutter 180px, header readouts wrap.
 * - Usable at 375px: label gutter drops to 132px, the header sheds the
 *   started-at readout, the latency strip keeps its markers, and the tags
 *   table values wrap mono text.
 *
 * Container policy (observability console archetype): dense frame rows and
 * panels, no Cards — waterfall rows are custom buttons on shared geometry,
 * the inspector is plain panel sections divided by Dividers, tags use a
 * compact children-mode Table, the stack excerpt uses CodeBlock.
 *
 * Color policy: token-pure chrome. ONE brand accent pair (Spanline violet,
 * light-dark(#7C3AED, #A78BFA)) reserved for the wordmark, the selected-row
 * ring, and the "this trace" marker on the latency strip. Service hues are
 * data-viz categorical tokens with repo-standard light-dark() fallbacks
 * (gateway uses a slate literal pair); error paint is a fixed red pair
 * light-dark(#DC2626, #F87171). No scheme-locked surfaces.
 *
 * Fixture policy: no Date.now, no Math.random, no network assets. Every
 * derived number (self time, service totals, map edge latencies, error and
 * span counts) is computed from the one SPANS array so the header, strip,
 * waterfall, inspector, and map always reconcile.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  AlertTriangleIcon,
  AudioWaveformIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  DatabaseIcon,
  GaugeIcon,
  LayersIcon,
  RotateCwIcon,
  ServerIcon,
  Share2Icon,
  TimerIcon,
} from 'lucide-react';

import {Badge} from '@astryxdesign/core/Badge';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {Heading, Text} from '@astryxdesign/core/Text';
import {useToast} from '@astryxdesign/core/Toast';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// Brand + palette
// ---------------------------------------------------------------------------

/** Spanline violet — the ONE brand accent pair (§ Color policy). */
const BRAND_ACCENT = 'light-dark(#7C3AED, #A78BFA)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(124,58,237,0.12), rgba(167,139,250,0.18))';

/** Error paint for the failed span + its chrome. */
const ERROR_COLOR = 'light-dark(#DC2626, #F87171)';
const ERROR_SOFT = 'light-dark(rgba(220,38,38,0.12), rgba(248,113,113,0.16))';

const MONO = 'var(--font-family-code, monospace)';

type ServiceId =
  | 'edge-gateway'
  | 'checkout-api'
  | 'payment-svc'
  | 'inventory-svc'
  | 'ledger-db';

type ServiceMeta = {
  label: string;
  /** Bar + map fill. Categorical tokens with repo-standard fallbacks. */
  color: string;
  /** Tinted fill for chips keyed to the service. */
  soft: string;
  icon: typeof ServerIcon;
};

// Gateway wears a slate literal pair (proxies read as neutral chrome in
// APM tools); the other four use data-viz categorical tokens (footgun 2).
const SERVICES: Record<ServiceId, ServiceMeta> = {
  'edge-gateway': {
    label: 'edge-gateway',
    color: 'light-dark(#475569, #94A3B8)',
    soft: 'light-dark(rgba(71,85,105,0.12), rgba(148,163,184,0.16))',
    icon: Share2Icon,
  },
  'checkout-api': {
    label: 'checkout-api',
    color: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
    soft: 'light-dark(rgba(1,113,227,0.12), rgba(76,158,255,0.16))',
    icon: ServerIcon,
  },
  'payment-svc': {
    label: 'payment-svc',
    color:
      'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
    soft: 'light-dark(rgba(235,110,0,0.12), rgba(255,147,48,0.16))',
    icon: ServerIcon,
  },
  'inventory-svc': {
    label: 'inventory-svc',
    color: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
    soft: 'light-dark(rgba(11,153,31,0.12), rgba(52,199,89,0.16))',
    icon: ServerIcon,
  },
  'ledger-db': {
    label: 'ledger-db',
    color: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
    soft: 'light-dark(rgba(14,126,139,0.12), rgba(51,184,199,0.16))',
    icon: DatabaseIcon,
  },
};

const SERVICE_IDS = Object.keys(SERVICES) as ServiceId[];

type SpanKind = 'server' | 'client' | 'internal' | 'db' | 'producer';

type Span = {
  id: string;
  parentId: string | null;
  service: ServiceId;
  name: string;
  kind: SpanKind;
  /** Offset from trace start, ms. */
  startMs: number;
  durationMs: number;
  status: 'ok' | 'error';
  tags: Array<[string, string]>;
};

// ---------------------------------------------------------------------------
// Trace fixture — POST /api/v1/checkout, captured 2026-07-02T14:37:12.408Z.
// Offsets/durations are hand-nested: every child fits inside its parent.
// ---------------------------------------------------------------------------

const TRACE_ID = '7f3a9c2e51b04d8a';
const TRACE_STARTED_AT = 'Jul 2, 2026 · 14:37:12.408 UTC';
const TRACE_ENDPOINT = 'POST /api/v1/checkout';
const TRACE_ENV = 'prod · us-east-1';
const TRACE_TOTAL_MS = 842;

const COMMON_TAGS: Array<[string, string]> = [
  ['env', 'prod'],
  ['region', 'us-east-1'],
];

// Builder keeps the 21-span fixture compact; COMMON_TAGS appended once.
function sp(
  id: string,
  parentId: string | null,
  service: ServiceId,
  name: string,
  kind: SpanKind,
  startMs: number,
  durationMs: number,
  status: 'ok' | 'error',
  tags: Array<[string, string]>,
): Span {
  return {id, parentId, service, name, kind, startMs, durationMs, status,
    tags: [...tags, ...COMMON_TAGS]};
}

const SPANS: Span[] = [
  sp('s01', null, 'edge-gateway', 'POST /api/v1/checkout', 'server', 0, 842, 'ok', [
    ['http.method', 'POST'], ['http.route', '/api/v1/checkout'],
    ['http.status_code', '200'], ['http.client_ip', '203.0.113.74'],
    ['version', 'gw-2026.06.30'],
  ]),
  sp('s02', 's01', 'edge-gateway', 'tls.handshake + route', 'internal', 0.8, 5.4, 'ok', [
    ['tls.version', 'TLSv1.3'], ['route.match', 'checkout-api:8443'],
  ]),
  sp('s03', 's01', 'checkout-api', 'POST /checkout', 'server', 8.2, 826.1, 'ok', [
    ['http.method', 'POST'], ['http.status_code', '200'],
    ['order.id', 'ord_9f27c1e4'], ['cart.items', '3'],
    ['version', 'checkout-api@4.18.2'],
  ]),
  sp('s04', 's03', 'checkout-api', 'auth.verify_session', 'internal', 10.1, 11.3, 'ok', [
    ['session.id', 'ses_c2d84a1b'], ['auth.method', 'bearer_jwt'],
  ]),
  sp('s05', 's03', 'checkout-api', 'POST inventory-svc /v1/reserve', 'client', 24.6, 74.0, 'ok', [
    ['peer.service', 'inventory-svc'], ['http.status_code', '200'],
    ['reservation.id', 'rsv_51b8d902'],
  ]),
  sp('s06', 's05', 'inventory-svc', 'POST /v1/reserve', 'server', 28.2, 66.3, 'ok', [
    ['http.status_code', '200'], ['sku.count', '3'],
    ['warehouse', 'ewr-04'], ['version', 'inventory-svc@2.9.0'],
  ]),
  sp('s07', 's06', 'ledger-db', 'SELECT stock_levels', 'db', 33.9, 37.2, 'ok', [
    ['db.system', 'postgresql'], ['db.name', 'ledger'],
    ['db.statement', 'SELECT qty FROM stock_levels WHERE sku = ANY($1)'],
    ['db.rows', '3'],
  ]),
  sp('s08', 's06', 'ledger-db', 'INSERT reservations', 'db', 73.4, 17.5, 'ok', [
    ['db.system', 'postgresql'], ['db.name', 'ledger'],
    ['db.statement', 'INSERT INTO reservations (order_id, sku, qty) …'],
    ['db.rows', '3'],
  ]),
  sp('s09', 's03', 'checkout-api', 'POST payment-svc /v1/charge', 'client', 112.4, 476.2, 'ok', [
    ['peer.service', 'payment-svc'], ['http.status_code', '201'],
    ['charge.amount', '148.50 USD'],
  ]),
  sp('s10', 's09', 'payment-svc', 'POST /v1/charge', 'server', 117.8, 466.0, 'ok', [
    ['http.status_code', '201'], ['charge.id', 'chg_e07b3f55'],
    ['psp.provider', 'northpay'], ['version', 'payment-svc@7.2.1'],
  ]),
  sp('s11', 's10', 'ledger-db', 'INSERT payment_intents', 'db', 125.6, 21.9, 'ok', [
    ['db.system', 'postgresql'], ['db.name', 'ledger'],
    ['db.statement', 'INSERT INTO payment_intents (charge_id, state) …'],
    ['db.rows', '1'],
  ]),
  sp('s12', 's10', 'payment-svc', 'psp.authorize', 'client', 152.3, 404.1, 'error', [
    ['peer.service', 'northpay-gateway'], ['http.status_code', '503'],
    ['error', 'true'], ['error.type', 'UpstreamUnavailable'],
    ['error.message', 'northpay POST /authorize returned 503 (attempt 1)'],
    ['retry.count', '1'], ['retry.backoff_ms', '180'],
  ]),
  sp('s13', 's12', 'payment-svc', 'psp.authorize · retry 1', 'client', 371.0, 182.6, 'ok', [
    ['peer.service', 'northpay-gateway'], ['http.status_code', '200'],
    ['psp.auth_code', 'A6K42Q'], ['retry.attempt', '2 of 3'],
  ]),
  sp('s14', 's10', 'ledger-db', 'UPDATE payment_intents', 'db', 562.1, 14.8, 'ok', [
    ['db.system', 'postgresql'], ['db.name', 'ledger'],
    ['db.statement', "UPDATE payment_intents SET state = 'authorized' …"],
    ['db.rows', '1'],
  ]),
  sp('s15', 's03', 'checkout-api', 'publish order.confirmed', 'producer', 596.3, 43.7, 'ok', [
    ['messaging.system', 'kafka'],
    ['messaging.destination', 'orders.confirmed.v2'],
    ['messaging.partition', '4'],
  ]),
  sp('s16', 's03', 'checkout-api', 'POST inventory-svc /v1/commit', 'client', 604.0, 98.2, 'ok', [
    ['peer.service', 'inventory-svc'], ['http.status_code', '200'],
    ['reservation.id', 'rsv_51b8d902'],
  ]),
  sp('s17', 's16', 'inventory-svc', 'POST /v1/commit', 'server', 609.7, 88.4, 'ok', [
    ['http.status_code', '200'], ['warehouse', 'ewr-04'],
    ['version', 'inventory-svc@2.9.0'],
  ]),
  sp('s18', 's17', 'ledger-db', 'UPDATE reservations', 'db', 617.5, 42.3, 'ok', [
    ['db.system', 'postgresql'], ['db.name', 'ledger'],
    ['db.statement', "UPDATE reservations SET state = 'committed' …"],
    ['db.rows', '3'],
  ]),
  sp('s19', 's03', 'ledger-db', 'INSERT orders', 'db', 708.9, 87.6, 'ok', [
    ['db.system', 'postgresql'], ['db.name', 'ledger'],
    ['db.statement', 'INSERT INTO orders (id, user_id, total_cents) …'],
    ['db.rows', '1'],
  ]),
  sp('s20', 's03', 'checkout-api', 'serialize response', 'internal', 801.2, 29.8, 'ok', [
    ['response.bytes', '2914'], ['content.type', 'application/json'],
  ]),
  sp('s21', 's01', 'edge-gateway', 'response.flush', 'internal', 836.1, 5.2, 'ok', [
    ['response.bytes', '2914'], ['compression', 'br'],
  ]),
];

/** Stack excerpt for the failed psp.authorize attempt (s12). */
const ERROR_STACK = `UpstreamUnavailableError: northpay POST /authorize returned 503 (attempt 1)
    at PspClient.authorize (psp/client.go:214)
    at ChargeProcessor.run (charge/processor.go:88)
    at handlers.PostCharge (http/handlers.go:141)
  caused by: read tcp 10.32.7.41:44872->198.51.100.9:443
    i/o timeout after 187ms (northpay-gateway pool "us-east-1a")
  retry: backoff 180ms → attempt 2 of 3 succeeded in 182.6ms (auth A6K42Q)`;

// ---------------------------------------------------------------------------
// Endpoint latency percentiles (last 1h, 2,341 requests) — fixture.
// ---------------------------------------------------------------------------

const LATENCY_SCALE_MAX_MS = 1800;
const LATENCY_REQUEST_COUNT = '2,341';
const PERCENTILES: Array<{label: string; ms: number}> = [
  {label: 'p50', ms: 412},
  {label: 'p95', ms: 1080},
  {label: 'p99', ms: 1640},
];

// ---------------------------------------------------------------------------
// Derived indexes — one pass over SPANS; every readout reconciles from these.
// ---------------------------------------------------------------------------

const SPAN_BY_ID = new Map<string, Span>(SPANS.map(s => [s.id, s]));

const CHILDREN_BY_ID = new Map<string, Span[]>();
for (const span of SPANS) {
  if (span.parentId !== null) {
    const list = CHILDREN_BY_ID.get(span.parentId) ?? [];
    list.push(span);
    CHILDREN_BY_ID.set(span.parentId, list);
  }
}
for (const list of CHILDREN_BY_ID.values()) {
  list.sort((a, b) => a.startMs - b.startMs);
}

const DEPTH_BY_ID = new Map<string, number>();
function resolveDepth(span: Span): number {
  const cached = DEPTH_BY_ID.get(span.id);
  if (cached !== undefined) {
    return cached;
  }
  const parent = span.parentId === null ? null : SPAN_BY_ID.get(span.parentId);
  const depth = parent ? resolveDepth(parent) + 1 : 0;
  DEPTH_BY_ID.set(span.id, depth);
  return depth;
}
SPANS.forEach(resolveDepth);

const ROOT_SPAN = SPANS[0];
const ERROR_SPANS = SPANS.filter(s => s.status === 'error');
const ERROR_SPAN_ID = ERROR_SPANS[0].id;

/** Self time = duration minus direct children (children never overlap). */
function selfTimeMs(span: Span): number {
  const children = CHILDREN_BY_ID.get(span.id) ?? [];
  const childSum = children.reduce((sum, c) => sum + c.durationMs, 0);
  return Math.max(0, span.durationMs - childSum);
}

/** Depth-first visible row order, honoring collapsed parents. */
function visibleSpans(collapsed: ReadonlySet<string>): Span[] {
  const rows: Span[] = [];
  const walk = (span: Span) => {
    rows.push(span);
    if (!collapsed.has(span.id)) {
      for (const child of CHILDREN_BY_ID.get(span.id) ?? []) {
        walk(child);
      }
    }
  };
  walk(ROOT_SPAN);
  return rows;
}

type MapEdge = {
  from: ServiceId;
  to: ServiceId;
  calls: number;
  avgMs: number;
  hasError: boolean;
};

/** Cross-service edges: parent span in one service, child in another. */
function buildServiceEdges(): MapEdge[] {
  const acc = new Map<
    string,
    {from: ServiceId; to: ServiceId; total: number; calls: number; err: boolean}
  >();
  for (const span of SPANS) {
    const parent =
      span.parentId === null ? null : SPAN_BY_ID.get(span.parentId);
    if (!parent || parent.service === span.service) {
      continue;
    }
    const key = `${parent.service}->${span.service}`;
    const entry = acc.get(key) ?? {
      from: parent.service,
      to: span.service,
      total: 0,
      calls: 0,
      err: false,
    };
    entry.total += span.durationMs;
    entry.calls += 1;
    entry.err = entry.err || span.status === 'error';
    acc.set(key, entry);
  }
  return [...acc.values()].map(e => ({
    from: e.from,
    to: e.to,
    calls: e.calls,
    avgMs: e.total / e.calls,
    hasError:
      e.err ||
      // An error anywhere inside the callee's subtree marks the edge.
      ERROR_SPANS.some(err => err.service === e.to),
  }));
}

const SERVICE_EDGES = buildServiceEdges();

/** Total time attributed to each service (self time of its spans). */
const SERVICE_SELF_MS = new Map<ServiceId, number>(
  SERVICE_IDS.map(id => [id, 0]),
);
for (const span of SPANS) {
  SERVICE_SELF_MS.set(
    span.service,
    (SERVICE_SELF_MS.get(span.service) ?? 0) + selfTimeMs(span),
  );
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function fmtMs(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)} s`;
  }
  if (ms >= 100) {
    return `${Math.round(ms)} ms`;
  }
  return `${ms.toFixed(1)} ms`;
}

function fmtPct(part: number, whole: number): string {
  const pct = (part / whole) * 100;
  return pct >= 10 ? `${Math.round(pct)}%` : `${pct.toFixed(1)}%`;
}

const KIND_LABEL: Record<SpanKind, string> = {
  server: 'server',
  client: 'client',
  internal: 'internal',
  db: 'db query',
  producer: 'queue producer',
};

// ---------------------------------------------------------------------------
// Styles — one typed record; geometry composes per-render on top of these.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  // Header
  brandMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 'var(--radius-container)',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    width: '100%',
    paddingBlock: 'var(--spacing-2)',
  },
  traceIdChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 2,
    borderRadius: 'var(--radius-control)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--text-supporting-size, 12px)',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  headerStat: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-1)',
    whiteSpace: 'nowrap',
  },
  // Latency strip
  latencyStrip: {
    borderBlockEnd: 'var(--border-width) solid var(--color-border)',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-surface)',
  },
  latencyTrackWrap: {
    position: 'relative',
    height: 44,
    marginBlockStart: 'var(--spacing-1)',
  },
  latencyTrack: {
    position: 'absolute',
    insetInline: 0,
    top: 18,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  latencyFill: {
    position: 'absolute',
    top: 18,
    left: 0,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_ACCENT_SOFT,
  },
  latencyMarker: {
    position: 'absolute',
    top: 14,
    width: 2,
    height: 16,
    borderRadius: 1,
    backgroundColor: 'var(--color-text-secondary)',
    transform: 'translateX(-1px)',
  },
  latencyMarkerLabel: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
  },
  latencyTraceMarker: {
    position: 'absolute',
    top: 12,
    width: 3,
    height: 20,
    borderRadius: 1.5,
    backgroundColor: BRAND_ACCENT,
    transform: 'translateX(-1.5px)',
    boxShadow: '0 0 0 1px var(--color-background-surface)',
  },
  latencyTraceLabel: {
    position: 'absolute',
    top: 32,
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    color: BRAND_ACCENT,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--text-supporting-size, 12px)',
    fontWeight: 600,
  },
  // Waterfall
  waterfallWrap: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    flex: 1,
  },
  axisRow: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    display: 'flex',
    borderBlockEnd: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  axisGutter: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 'var(--spacing-3)',
    borderInlineEnd: 'var(--border-width) solid var(--color-border)',
  },
  axisTrack: {
    position: 'relative',
    flex: 1,
    height: 28,
    overflow: 'hidden',
  },
  axisTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    borderInlineStart: 'var(--border-width) solid var(--color-border)',
    paddingInlineStart: 4,
  },
  rowsScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  rowsRelative: {
    position: 'relative',
  },
  gridline: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0,
    borderInlineStart: 'var(--border-width) solid var(--color-border)',
    opacity: 0.6,
    pointerEvents: 'none',
  },
  spanRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'stretch',
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    textAlign: 'start',
    font: 'inherit',
    color: 'inherit',
    borderBlockEnd: 'var(--border-width) solid var(--color-border)',
    minHeight: 34,
  },
  spanRowSelected: {
    backgroundColor: BRAND_ACCENT_SOFT,
    boxShadow: `inset 0 0 0 1px ${BRAND_ACCENT}`,
  },
  spanRowDimmed: {
    opacity: 0.42,
  },
  rowGutter: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    paddingInlineEnd: 'var(--spacing-2)',
    borderInlineEnd: 'var(--border-width) solid var(--color-border)',
    minWidth: 0,
    overflow: 'hidden',
  },
  rowChevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: 'var(--radius-control)',
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    flexShrink: 0,
    padding: 0,
  },
  rowChevronSpacer: {width: 20, flexShrink: 0},
  serviceKey: {
    width: 8,
    height: 8,
    borderRadius: 2,
    flexShrink: 0,
  },
  rowName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 'var(--text-supporting-size, 12px)',
    color: 'var(--color-text-primary)',
  },
  rowTrack: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
  },
  spanBar: {
    position: 'absolute',
    height: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    borderRadius: 3,
    minWidth: 3,
  },
  spanBarLabel: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  // Near-full-width bars leave no room on either side; the caption rides the
  // bar's right end on a surface pill so it stays AA in both schemes.
  spanBarLabelInside: {
    backgroundColor: 'var(--color-background-surface)',
    paddingInline: 4,
    borderRadius: 3,
  },
  // Inspector panel
  panelSticky: {
    position: 'sticky',
    insetBlockStart: 0,
    maxHeight: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  panelSection: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  kindChip: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 'var(--spacing-1)',
    borderRadius: 'var(--radius-control)',
    border: 'var(--border-width) solid var(--color-border)',
    fontSize: 11,
    fontFamily: MONO,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  serviceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 'var(--spacing-1)',
    borderRadius: 'var(--radius-control)',
    fontSize: 11,
    fontFamily: MONO,
    whiteSpace: 'nowrap',
  },
  timingBar: {
    position: 'relative',
    display: 'flex',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  timingSegment: {height: '100%'},
  timingLegendKey: {
    width: 8,
    height: 8,
    borderRadius: 2,
    flexShrink: 0,
  },
  // Child-span jump link in the timing legend: plain text button on the same
  // supporting-size line as "exclusive (self)" so legend rows align.
  timingLegendLink: {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 'var(--text-supporting-size, 12px)',
    color: 'var(--color-text-primary)',
    textAlign: 'start',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
    textDecorationColor: 'var(--color-border)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  mono: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
  },
  numCell: {
    textAlign: 'end',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  tagValue: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--text-supporting-size, 12px)',
    overflowWrap: 'anywhere',
  },
  // Error stack CodeBlock: soften isWrapped's break-all (footgun 13).
  stackBlock: {
    wordBreak: 'normal',
    overflowWrap: 'anywhere',
    width: '100%',
  },
  errorCallout: {
    borderRadius: 'var(--radius-container)',
    border: `var(--border-width) solid ${ERROR_COLOR}`,
    backgroundColor: ERROR_SOFT,
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  // Service map
  mapSvg: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  mapLegendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  serviceLegendButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 2,
    borderRadius: 'var(--radius-control)',
    border: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-supporting-size, 12px)',
    minHeight: 26,
  },
  serviceLegendActive: {
    boxShadow: `inset 0 0 0 1px ${BRAND_ACCENT}`,
    backgroundColor: BRAND_ACCENT_SOFT,
  },
  // Stacked (<=900px) inspector section
  stackedInspector: {
    borderBlockStart: 'var(--border-width) solid var(--color-border)',
  },
};

// ---------------------------------------------------------------------------
// Latency strip — p50/p95/p99 for the endpoint + this trace's marker.
// ---------------------------------------------------------------------------

function LatencyStrip() {
  const tracePct = (TRACE_TOTAL_MS / LATENCY_SCALE_MAX_MS) * 100;
  return (
    <section aria-label="Endpoint latency, last hour" style={styles.latencyStrip}>
      <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
        <Icon icon={GaugeIcon} size="xsm" color="secondary" />
        <Text type="label">Endpoint latency</Text>
        <Text type="supporting" color="secondary">
          {TRACE_ENDPOINT} · last 1h · {LATENCY_REQUEST_COUNT} requests
        </Text>
        <StackItem size="fill" />
        {PERCENTILES.map(p => (
          <span key={p.label} style={styles.headerStat}>
            <Text type="supporting" color="secondary">
              {p.label}
            </Text>
            <Text type="supporting" hasTabularNumbers>
              {fmtMs(p.ms)}
            </Text>
          </span>
        ))}
      </HStack>
      <div style={styles.latencyTrackWrap}>
        <div style={styles.latencyTrack} />
        <div
          style={{...styles.latencyFill, width: `${tracePct}%`}}
          aria-hidden
        />
        {PERCENTILES.map(p => {
          const pct = (p.ms / LATENCY_SCALE_MAX_MS) * 100;
          return (
            <div key={p.label}>
              <div style={{...styles.latencyMarker, left: `${pct}%`}} />
              <span
                style={{...styles.latencyMarkerLabel, left: `${pct}%`}}>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {p.label} · {fmtMs(p.ms)}
                </Text>
              </span>
            </div>
          );
        })}
        <Tooltip content={`This trace: ${fmtMs(TRACE_TOTAL_MS)} — between p50 and p95`}>
          <div style={{...styles.latencyTraceMarker, left: `${tracePct}%`}} />
        </Tooltip>
        <span style={{...styles.latencyTraceLabel, left: `${tracePct}%`}}>
          this trace · {fmtMs(TRACE_TOTAL_MS)}
        </span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Service map — 5 nodes, latency edges computed from the span tree.
// ---------------------------------------------------------------------------

const MAP_NODE_POS: Record<
  ServiceId,
  {x: number; y: number; labelSide: 'above' | 'below'}
> = {
  'edge-gateway': {x: 38, y: 105, labelSide: 'below'},
  'checkout-api': {x: 132, y: 105, labelSide: 'below'},
  'payment-svc': {x: 224, y: 42, labelSide: 'above'},
  'inventory-svc': {x: 224, y: 168, labelSide: 'below'},
  'ledger-db': {x: 305, y: 105, labelSide: 'below'},
};

/** Hand-tuned label anchors so edge captions never collide. */
const EDGE_LABEL_OFFSET: Record<string, {dx: number; dy: number}> = {
  'edge-gateway->checkout-api': {dx: 0, dy: -8},
  'checkout-api->payment-svc': {dx: -16, dy: -6},
  'checkout-api->inventory-svc': {dx: -16, dy: 14},
  'checkout-api->ledger-db': {dx: 42, dy: 12},
  'payment-svc->ledger-db': {dx: 16, dy: -6},
  'inventory-svc->ledger-db': {dx: 16, dy: 14},
};

function ServiceMap({
  focusedService,
  onToggleService,
}: {
  focusedService: ServiceId | null;
  onToggleService: (id: ServiceId) => void;
}) {
  return (
    <VStack gap={2}>
      <svg
        viewBox="0 0 340 210"
        style={styles.mapSvg}
        role="img"
        aria-label="Service map: edge-gateway calls checkout-api; checkout-api calls payment-svc, inventory-svc, and ledger-db; payment-svc and inventory-svc also call ledger-db">
        {SERVICE_EDGES.map(edge => {
          const from = MAP_NODE_POS[edge.from];
          const to = MAP_NODE_POS[edge.to];
          const key = `${edge.from}->${edge.to}`;
          const off = EDGE_LABEL_OFFSET[key] ?? {dx: 0, dy: -6};
          const midX = (from.x + to.x) / 2 + off.dx;
          const midY = (from.y + to.y) / 2 + off.dy;
          const stroke = edge.hasError
            ? ERROR_COLOR
            : 'var(--color-text-secondary)';
          return (
            <g key={key}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={stroke}
                strokeOpacity={edge.hasError ? 0.85 : 0.35}
                strokeWidth={edge.hasError ? 1.8 : 1.2}
              />
              <text
                x={midX}
                y={midY}
                textAnchor="middle"
                fontSize={8.5}
                fontFamily={MONO}
                fill={edge.hasError ? ERROR_COLOR : 'var(--color-text-secondary)'}>
                {fmtMs(edge.avgMs)} · {edge.calls}×
              </text>
            </g>
          );
        })}
        {SERVICE_IDS.map(id => {
          const pos = MAP_NODE_POS[id];
          const meta = SERVICES[id];
          const hasError = ERROR_SPANS.some(s => s.service === id);
          const isFocused = focusedService === id;
          const labelY = pos.labelSide === 'above' ? pos.y - 22 : pos.y + 26;
          return (
            <g
              key={id}
              onClick={() => onToggleService(id)}
              style={{cursor: 'pointer'}}>
              {isFocused ? (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={17}
                  fill="none"
                  stroke={BRAND_ACCENT}
                  strokeWidth={2}
                />
              ) : null}
              <circle cx={pos.x} cy={pos.y} r={13} fill={meta.color} />
              {hasError ? (
                <circle
                  cx={pos.x + 10}
                  cy={pos.y - 10}
                  r={4.5}
                  fill={ERROR_COLOR}
                  stroke="var(--color-background-surface)"
                  strokeWidth={1.5}
                />
              ) : null}
              <text
                x={pos.x}
                y={labelY}
                textAnchor="middle"
                fontSize={9}
                fontFamily={MONO}
                fill="var(--color-text-primary)">
                {meta.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={styles.mapLegendRow} role="group" aria-label="Filter waterfall by service">
        {SERVICE_IDS.map(id => {
          const isActive = focusedService === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onToggleService(id)}
              style={
                isActive
                  ? {...styles.serviceLegendButton, ...styles.serviceLegendActive}
                  : styles.serviceLegendButton
              }>
              <span
                style={{...styles.serviceKey, backgroundColor: SERVICES[id].color}}
              />
              <span style={styles.mono}>{SERVICES[id].label}</span>
            </button>
          );
        })}
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// Waterfall — shared ms→% scale; axis, gridlines, and bars all derive from it.
// ---------------------------------------------------------------------------

const AXIS_TICKS_MS = [0, 100, 200, 300, 400, 500, 600, 700, 800];

function msToPct(ms: number): number {
  return (ms / TRACE_TOTAL_MS) * 100;
}

function TimeAxis({gutterWidth}: {gutterWidth: number}) {
  return (
    <div style={styles.axisRow} aria-hidden>
      <div style={{...styles.axisGutter, width: gutterWidth}}>
        <Text type="supporting" color="secondary">
          Span
        </Text>
      </div>
      <div style={styles.axisTrack}>
        {AXIS_TICKS_MS.map((tick, index) => {
          // Captions at 0/200/400/600 only — the 700/800 captions clip or
          // crowd against the track's right edge (800ms sits at 95% of the
          // 842 ms scale). Uncaptioned ticks keep their line so the axis
          // matches the 100 ms gridline rhythm in the rows below.
          const hasCaption =
            tick % 200 === 0 && index !== AXIS_TICKS_MS.length - 1;
          return (
            <span
              key={tick}
              style={{...styles.axisTick, left: `${msToPct(tick)}%`}}>
              {hasCaption ? (
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {tick}ms
                </Text>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

type SpanRowProps = {
  span: Span;
  gutterWidth: number;
  isSelected: boolean;
  isDimmed: boolean;
  isCollapsed: boolean;
  hasChildren: boolean;
  showKindChip: boolean;
  onSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
};

function SpanRow({
  span,
  gutterWidth,
  isSelected,
  isDimmed,
  isCollapsed,
  hasChildren,
  showKindChip,
  onSelect,
  onToggleCollapse,
}: SpanRowProps) {
  const depth = DEPTH_BY_ID.get(span.id) ?? 0;
  const isError = span.status === 'error';
  const barColor = isError ? ERROR_COLOR : SERVICES[span.service].color;
  const startPct = msToPct(span.startMs);
  const widthPct = msToPct(span.durationMs);
  const endPct = startPct + widthPct;
  // Duration caption sits after the bar unless the bar ends deep in the
  // track, in which case it flips to sit before the bar start. Bars that
  // ALSO start near 0 (near-full-width) have no room on either side, so the
  // caption rides the bar's right end on a surface pill instead of bleeding
  // into the label gutter.
  const labelMode: 'after' | 'before' | 'inside' =
    endPct <= 78 ? 'after' : startPct >= 12 ? 'before' : 'inside';
  const labelStyle: CSSProperties =
    labelMode === 'after'
      ? {...styles.spanBarLabel, left: `calc(${endPct}% + 6px)`}
      : labelMode === 'before'
        ? {...styles.spanBarLabel, right: `calc(${100 - startPct}% + 6px)`}
        : {
            ...styles.spanBarLabel,
            ...styles.spanBarLabelInside,
            right: `calc(${100 - endPct}% + 6px)`,
          };
  const rowStyle: CSSProperties = {
    ...styles.spanRow,
    ...(isSelected ? styles.spanRowSelected : null),
    ...(isDimmed ? styles.spanRowDimmed : null),
  };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${span.name}, ${SERVICES[span.service].label}, ${fmtMs(span.durationMs)}${isError ? ', error' : ''}`}
      style={rowStyle}
      onClick={() => onSelect(span.id)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(span.id);
        }
      }}>
      <div
        style={{
          ...styles.rowGutter,
          width: gutterWidth,
          paddingInlineStart: 8 + depth * 14,
        }}>
        {hasChildren ? (
          <button
            type="button"
            aria-expanded={!isCollapsed}
            aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} children of ${span.name}`}
            style={styles.rowChevron}
            onClick={event => {
              event.stopPropagation();
              onToggleCollapse(span.id);
            }}
            onKeyDown={event => event.stopPropagation()}>
            <Icon
              icon={isCollapsed ? ChevronRightIcon : ChevronDownIcon}
              size="xsm"
              color="inherit"
            />
          </button>
        ) : (
          <span style={styles.rowChevronSpacer} />
        )}
        <span style={{...styles.serviceKey, backgroundColor: barColor}} />
        {isError ? (
          <span style={{color: ERROR_COLOR, display: 'inline-flex', flexShrink: 0}}>
            <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
          </span>
        ) : null}
        {span.tags.some(([key]) => key === 'retry.attempt') ? (
          <span
            style={{
              color: 'var(--color-text-secondary)',
              display: 'inline-flex',
              flexShrink: 0,
            }}>
            <Icon icon={RotateCwIcon} size="xsm" color="inherit" />
          </span>
        ) : null}
        <span style={styles.rowName}>{span.name}</span>
        {showKindChip ? (
          <span style={{...styles.kindChip, marginInlineStart: 'auto'}}>
            {SERVICES[span.service].label}
          </span>
        ) : null}
      </div>
      <div style={styles.rowTrack}>
        <div
          style={{
            ...styles.spanBar,
            left: `${startPct}%`,
            width: `${widthPct}%`,
            backgroundColor: barColor,
            opacity: isError ? 0.92 : 0.78,
          }}
        />
        <span style={labelStyle}>{fmtMs(span.durationMs)}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Span inspector — timing breakdown, tags table, error stack.
// ---------------------------------------------------------------------------

function InspectorRow({label, children}: {label: string; children: ReactNode}) {
  return (
    <HStack gap={2} vAlign="start">
      <StackItem style={{width: 96, flexShrink: 0}}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
      </StackItem>
      {children}
    </HStack>
  );
}

function SpanInspector({
  span,
  onSelectSpan,
}: {
  span: Span;
  onSelectSpan: (id: string) => void;
}) {
  const meta = SERVICES[span.service];
  const children = CHILDREN_BY_ID.get(span.id) ?? [];
  const self = selfTimeMs(span);
  const isError = span.status === 'error';
  return (
    <VStack gap={0}>
      <div style={styles.panelSection}>
        <VStack gap={1}>
          <Heading level={4} accessibilityLevel={2} maxLines={2}>
            {span.name}
          </Heading>
          <HStack gap={1} vAlign="center" style={{flexWrap: 'wrap'}}>
            <span
              style={{
                ...styles.serviceChip,
                backgroundColor: meta.soft,
                color: 'var(--color-text-primary)',
              }}>
              <span style={{...styles.serviceKey, backgroundColor: meta.color}} />
              {meta.label}
            </span>
            <span style={styles.kindChip}>{KIND_LABEL[span.kind]}</span>
            {isError ? (
              <Badge label="error · 503" variant="error" />
            ) : (
              <Badge label="ok" variant="success" />
            )}
          </HStack>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            span {span.id} · trace {TRACE_ID}
          </Text>
        </VStack>
      </div>
      <Divider />
      <div style={styles.panelSection}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon={TimerIcon} size="xsm" color="secondary" />
            <Text type="label">Timing</Text>
          </HStack>
          <InspectorRow label="Started">
            <Text type="supporting" hasTabularNumbers>
              +{fmtMs(span.startMs)} into trace
            </Text>
          </InspectorRow>
          <InspectorRow label="Duration">
            <Text type="supporting" hasTabularNumbers>
              {fmtMs(span.durationMs)} · {fmtPct(span.durationMs, TRACE_TOTAL_MS)}{' '}
              of trace
            </Text>
          </InspectorRow>
          <InspectorRow label="Self time">
            <Text type="supporting" hasTabularNumbers>
              {fmtMs(self)} · {fmtPct(self, span.durationMs)} of span
            </Text>
          </InspectorRow>
          <div
            style={styles.timingBar}
            role="img"
            aria-label={`Self time ${fmtMs(self)} of ${fmtMs(span.durationMs)} total`}>
            <span
              style={{
                ...styles.timingSegment,
                width: `${(self / span.durationMs) * 100}%`,
                backgroundColor: isError ? ERROR_COLOR : meta.color,
              }}
            />
            {children.map(child => (
              <span
                key={child.id}
                style={{
                  ...styles.timingSegment,
                  width: `${(child.durationMs / span.durationMs) * 100}%`,
                  backgroundColor:
                    child.status === 'error'
                      ? ERROR_COLOR
                      : SERVICES[child.service].color,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <span
                style={{
                  ...styles.timingLegendKey,
                  backgroundColor: isError ? ERROR_COLOR : meta.color,
                }}
              />
              <Text type="supporting">exclusive (self)</Text>
              <StackItem size="fill" />
              <Text type="supporting" hasTabularNumbers>
                {fmtMs(self)}
              </Text>
            </HStack>
            {children.map(child => (
              <HStack key={child.id} gap={2} vAlign="center">
                <span
                  style={{
                    ...styles.timingLegendKey,
                    backgroundColor:
                      child.status === 'error'
                        ? ERROR_COLOR
                        : SERVICES[child.service].color,
                    opacity: 0.7,
                  }}
                />
                <button
                  type="button"
                  style={styles.timingLegendLink}
                  onClick={() => onSelectSpan(child.id)}>
                  {child.name}
                </button>
                <StackItem size="fill" />
                <Text type="supporting" hasTabularNumbers>
                  {fmtMs(child.durationMs)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </div>
      <Divider />
      <div style={styles.panelSection}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon={LayersIcon} size="xsm" color="secondary" />
            <Text type="label">Tags</Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {span.tags.length}
            </Text>
          </HStack>
          <Table density="compact" dividers="rows">
            <TableHeader>
              <TableRow isHeaderRow>
                {/* Fixed key column: width AND minWidth (footgun 4). */}
                <TableHeaderCell scope="col" style={{width: 132, minWidth: 132}}>
                  Key
                </TableHeaderCell>
                <TableHeaderCell scope="col">Value</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {span.tags.map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>
                    <Text type="supporting" color="secondary">
                      {key}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <span style={styles.tagValue}>{value}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </VStack>
      </div>
      {isError ? (
        <>
          <Divider />
          <div style={styles.panelSection}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <span style={{color: ERROR_COLOR, display: 'inline-flex'}}>
                  <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
                </span>
                <Text type="label">Error</Text>
              </HStack>
              <div style={styles.errorCallout}>
                <Text type="supporting">
                  UpstreamUnavailable — northpay POST /authorize returned 503 on
                  attempt 1; retry 1 succeeded after 180 ms backoff.
                </Text>
              </div>
              <CodeBlock
                code={ERROR_STACK}
                language="plaintext"
                title="stack excerpt"
                hasCopyButton
                isWrapped
                style={styles.stackBlock}
              />
            </VStack>
          </div>
        </>
      ) : null}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// Service breakdown — self-time per service; sums exactly to the trace total.
// ---------------------------------------------------------------------------

function ServiceBreakdown() {
  return (
    <VStack gap={1}>
      {SERVICE_IDS.map(id => {
        const ms = SERVICE_SELF_MS.get(id) ?? 0;
        return (
          <HStack key={id} gap={2} vAlign="center">
            <span
              style={{...styles.serviceKey, backgroundColor: SERVICES[id].color}}
            />
            <span style={{...styles.mono, fontSize: 12}}>
              {SERVICES[id].label}
            </span>
            <StackItem size="fill" />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {fmtPct(ms, TRACE_TOTAL_MS)}
            </Text>
            <span style={{...styles.numCell, fontSize: 12, width: 64}}>
              {fmtMs(ms)}
            </span>
          </HStack>
        );
      })}
      <Divider />
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary">
          Total (= trace duration)
        </Text>
        <StackItem size="fill" />
        <span style={{...styles.numCell, fontSize: 12, width: 64}}>
          {fmtMs(TRACE_TOTAL_MS)}
        </span>
      </HStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ApmTraceWaterfallTemplate() {
  const toast = useToast();
  const isNarrow = useMediaQuery('(max-width: 1240px)');
  const isStacked = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // The failed PSP authorization is pre-selected so the error stack, retry
  // child, and red bar all read at first paint.
  const [selectedId, setSelectedId] = useState<string>(ERROR_SPAN_ID);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [focusedService, setFocusedService] = useState<ServiceId | null>(null);

  const rows = useMemo(() => visibleSpans(collapsed), [collapsed]);
  const selectedSpan = SPAN_BY_ID.get(selectedId) ?? ROOT_SPAN;

  const gutterWidth = isPhone ? 132 : isStacked ? 180 : isNarrow ? 220 : 300;

  const handleToggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleService = (id: ServiceId) => {
    setFocusedService(prev => (prev === id ? null : id));
  };

  const handleCopyTraceId = () => {
    try {
      void navigator.clipboard?.writeText(TRACE_ID);
    } catch {
      // Clipboard access is best-effort; the toast still confirms intent.
    }
    toast({body: `Copied trace ${TRACE_ID}`, isAutoHide: true});
  };

  const gridlines = AXIS_TICKS_MS.filter(t => t > 0).map(tick => (
    <div
      key={tick}
      style={{
        ...styles.gridline,
        left: `calc(${gutterWidth}px + (100% - ${gutterWidth}px) * ${(
          tick / TRACE_TOTAL_MS
        ).toFixed(6)})`,
      }}
    />
  ));

  const spanRows = (
    <div style={styles.rowsRelative}>
      {gridlines}
      {rows.map(span => (
        <SpanRow
          key={span.id}
          span={span}
          gutterWidth={gutterWidth}
          isSelected={span.id === selectedId}
          isDimmed={focusedService !== null && span.service !== focusedService}
          isCollapsed={collapsed.has(span.id)}
          hasChildren={CHILDREN_BY_ID.has(span.id)}
          showKindChip={!isNarrow}
          onSelect={setSelectedId}
          onToggleCollapse={handleToggleCollapse}
        />
      ))}
    </div>
  );

  const inspectorPane = (
    <VStack gap={0}>
      <SpanInspector span={selectedSpan} onSelectSpan={setSelectedId} />
      <Divider />
      <div style={styles.panelSection}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon={Share2Icon} size="xsm" color="secondary" />
            <Text type="label">Service map</Text>
            <Text type="supporting" color="secondary">
              this trace
            </Text>
          </HStack>
          <ServiceMap
            focusedService={focusedService}
            onToggleService={handleToggleService}
          />
        </VStack>
      </div>
      <Divider />
      <div style={styles.panelSection}>
        <VStack gap={2}>
          <Text type="label">Time by service (self)</Text>
          <ServiceBreakdown />
        </VStack>
      </div>
    </VStack>
  );

  const header = (
    <LayoutHeader hasDivider>
      <div style={styles.headerRow}>
        <HStack gap={2} vAlign="center">
          <span style={styles.brandMark}>
            <Icon icon={AudioWaveformIcon} size="sm" color="inherit" />
          </span>
          <Heading level={4} accessibilityLevel={1} maxLines={1}>
            Spanline
          </Heading>
          <Text type="supporting" color="secondary">
            APM · Traces
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
          <Text type="label" maxLines={1}>
            {TRACE_ENDPOINT}
          </Text>
          <span style={styles.traceIdChip}>
            {TRACE_ID}
            <IconButton
              label="Copy trace id"
              tooltip="Copy trace id"
              icon={<Icon icon={CopyIcon} size="xsm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={handleCopyTraceId}
            />
          </span>
          {!isPhone ? (
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {TRACE_STARTED_AT} · {TRACE_ENV}
            </Text>
          ) : null}
        </HStack>
        <StackItem size="fill" />
        <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap'}}>
          <span style={styles.headerStat}>
            <Text type="label" hasTabularNumbers>
              {fmtMs(TRACE_TOTAL_MS)}
            </Text>
            <Text type="supporting" color="secondary">
              total
            </Text>
          </span>
          <span style={styles.headerStat}>
            <Text type="label" hasTabularNumbers>
              {SERVICE_IDS.length}
            </Text>
            <Text type="supporting" color="secondary">
              services
            </Text>
          </span>
          <span style={styles.headerStat}>
            <Text type="label" hasTabularNumbers>
              {SPANS.length}
            </Text>
            <Text type="supporting" color="secondary">
              spans
            </Text>
          </span>
          <Badge
            label={`${ERROR_SPANS.length} error`}
            variant="error"
          />
        </HStack>
      </div>
    </LayoutHeader>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        end={
          !isStacked ? (
            <LayoutPanel
              hasDivider
              width={isNarrow ? 320 : 380}
              padding={0}
              label="Span inspector">
              <div style={styles.panelSticky}>{inspectorPane}</div>
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent padding={0}>
            {isStacked ? (
              <div style={{height: '100%', overflowY: 'auto', minHeight: 0}}>
                <LatencyStrip />
                <TimeAxis gutterWidth={gutterWidth} />
                {spanRows}
                <div style={styles.stackedInspector}>{inspectorPane}</div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: 0,
                }}>
                <LatencyStrip />
                <div style={styles.waterfallWrap}>
                  <TimeAxis gutterWidth={gutterWidth} />
                  <div style={styles.rowsScroll}>{spanRows}</div>
                </div>
              </div>
            )}
          </LayoutContent>
        }
      />
    </div>
  );
}
