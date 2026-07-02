// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file table-inline-expansion.tsx
 * @input Deterministic fixtures only (API endpoint registry rows with
 *   per-endpoint detail: description, runtime metadata, related endpoints)
 * @output Full-width endpoint registry table where a per-row toggle
 *   IconButton expands the row in place: a colSpan detail row appears
 *   beneath it with the endpoint description, a MetadataList of runtime
 *   facts, related endpoints, and quick actions. A Set<string> in useState
 *   tracks which rows are open; the header offers Expand all / Collapse all
 * @position Page template; emitted by `astryx template table-inline-expansion`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the
 * registry title + route count, an Expand all / Collapse all toggle, and
 * the "New endpoint" primary action. LayoutContent holds one full-width
 * Table in children mode (TableHeader/TableBody/TableRow/TableCell) so
 * each data row can be followed by an optional full-span detail row —
 * the data-driven column API cannot interleave rows, children mode can.
 *
 * Interaction contract (expanding a row):
 * - Expanded row ids live in a Set<string> in useState; toggling clones
 *   the set so React re-renders. Multiple rows may be open at once.
 * - Each row's first cell is an IconButton with aria-expanded and (when
 *   open) aria-controls pointing at the detail row's id. The icon swaps
 *   Plus (closed) / XMark (open); the local heroicons shim exports no
 *   chevrons — with the real package this pair would be
 *   ChevronRightIcon / ChevronDownIcon.
 * - One row ships expanded (POST /v1/charges) so the detail region is
 *   visible on first render without interaction.
 *
 * Responsive contract:
 * - The Table renders inside its own horizontal scroll wrapper: fixed
 *   pixel widths on the toggle/numeric/status columns hold, the Endpoint
 *   column absorbs remaining width, and the whole table scrolls
 *   horizontally rather than crushing columns on narrow viewports.
 * - Detail region: MetadataList uses columns="multi" (auto-fill,
 *   minmax 280px), so metadata reflows from several columns on wide
 *   viewports down to a single column as space narrows; the related
 *   endpoints row and the action buttons wrap (HStack wrap="wrap").
 * - Header: the title block keeps priority via StackItem fill; the two
 *   header buttons keep their width and never wrap mid-label.
 */

import {useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Code} from '@astryxdesign/core/Code';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {
  BookmarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Numeric cells right-align with tabular numerals so digits line up.
  numeric: {textAlign: 'right', fontVariantNumeric: 'tabular-nums'},
  // Fixed-width leading toggle column; keeps the button snug to the edge.
  toggleHeader: {width: 44},
  // The detail row reads as a continuation of its parent row: muted
  // background across the full span, content inset to align under the
  // Endpoint column rather than under the toggle gutter.
  detailCell: {backgroundColor: 'var(--color-background-muted)'},
  detailBody: {
    padding:
      'var(--spacing-2) var(--spacing-2) var(--spacing-3) var(--spacing-8)',
  },
};

// ============= DATA =============

type Method = 'GET' | 'POST' | 'DELETE';
type EndpointStatus = 'live' | 'beta' | 'degraded' | 'deprecated';

interface RelatedEndpoint {
  method: Method;
  path: string;
  note: string;
}

interface ApiEndpoint {
  id: string;
  method: Method;
  path: string;
  requests: string; // last 24h, formatted
  errorRate: string;
  p95: string;
  status: EndpointStatus;
  owner: string;
  // Detail region content, revealed on expansion.
  description: string;
  auth: string;
  rateLimit: string;
  cache: string;
  regions: string;
  release: string;
  slo: string;
  related: RelatedEndpoint[];
}

const METHOD_VARIANT: Record<Method, BadgeVariant> = {
  GET: 'blue',
  POST: 'green',
  DELETE: 'red',
};

const STATUS_META: Record<EndpointStatus, {variant: BadgeVariant; label: string}> = {
  live: {variant: 'success', label: 'Live'},
  beta: {variant: 'purple', label: 'Beta'},
  degraded: {variant: 'warning', label: 'Degraded'},
  deprecated: {variant: 'neutral', label: 'Deprecated'},
};

// Production gateway routes for a payments API. Traffic numbers are the
// last 24 hours; release strings pin a fixed deploy date (no clocks).
const ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'charges-post',
    method: 'POST',
    path: '/v1/charges',
    requests: '812,440',
    errorRate: '0.31%',
    p95: '342 ms',
    status: 'live',
    owner: 'Payments Core',
    description:
      'Creates a charge against a saved payment method or a one-time token. ' +
      'Amounts are in the smallest currency unit; charges capture immediately ' +
      'unless capture=false is passed for a two-step flow.',
    auth: 'Secret key (Bearer)',
    rateLimit: '600 req/min per key',
    cache: 'None (mutating)',
    regions: 'us-east-1 · eu-west-1',
    release: 'v2026-06-28.1 · deployed Jun 28, 2026',
    slo: '99.95% availability · P95 < 400 ms',
    related: [
      {method: 'GET', path: '/v1/charges/:id', note: 'Retrieve a created charge'},
      {method: 'POST', path: '/v1/refunds', note: 'Reverse a captured charge'},
    ],
  },
  {
    id: 'charges-get',
    method: 'GET',
    path: '/v1/charges/:id',
    requests: '1,204,118',
    errorRate: '0.04%',
    p95: '88 ms',
    status: 'live',
    owner: 'Payments Core',
    description:
      'Retrieves a single charge by id, including its capture state, refund ' +
      'history, and the outcome of risk evaluation. Safe to poll; responses ' +
      'carry strong ETags.',
    auth: 'Secret or restricted key',
    rateLimit: '1,200 req/min per key',
    cache: '15 s edge cache (private)',
    regions: 'us-east-1 · eu-west-1 · ap-southeast-2',
    release: 'v2026-06-28.1 · deployed Jun 28, 2026',
    slo: '99.99% availability · P95 < 120 ms',
    related: [
      {method: 'POST', path: '/v1/charges', note: 'Create a charge'},
      {
        method: 'GET',
        path: '/v1/balance_transactions',
        note: 'Ledger entries for a charge',
      },
    ],
  },
  {
    id: 'refunds-post',
    method: 'POST',
    path: '/v1/refunds',
    requests: '96,512',
    errorRate: '0.72%',
    p95: '410 ms',
    status: 'live',
    owner: 'Payments Core',
    description:
      'Refunds a captured charge in full or in part. Partial refunds may be ' +
      'issued repeatedly until the captured amount is exhausted; each refund ' +
      'emits a refund.updated webhook on settlement.',
    auth: 'Secret key (Bearer)',
    rateLimit: '300 req/min per key',
    cache: 'None (mutating)',
    regions: 'us-east-1 · eu-west-1',
    release: 'v2026-06-14.3 · deployed Jun 14, 2026',
    slo: '99.95% availability · P95 < 500 ms',
    related: [
      {method: 'GET', path: '/v1/charges/:id', note: 'Check refundable amount'},
    ],
  },
  {
    id: 'customers-get',
    method: 'GET',
    path: '/v1/customers/:id',
    requests: '688,204',
    errorRate: '0.09%',
    p95: '74 ms',
    status: 'live',
    owner: 'Identity',
    description:
      'Retrieves a customer profile with default payment method, billing ' +
      'address, and tax status. PII fields are redacted for restricted keys ' +
      'without the customers:read scope.',
    auth: 'Secret or restricted key',
    rateLimit: '1,200 req/min per key',
    cache: '30 s edge cache (private)',
    regions: 'us-east-1 · eu-west-1 · ap-southeast-2',
    release: 'v2026-06-21.2 · deployed Jun 21, 2026',
    slo: '99.99% availability · P95 < 100 ms',
    related: [
      {method: 'DELETE', path: '/v1/tokens/:id', note: 'Detach a saved token'},
    ],
  },
  {
    id: 'payment-intents-post',
    method: 'POST',
    path: '/v1/payment_intents',
    requests: '154,882',
    errorRate: '1.24%',
    p95: '505 ms',
    status: 'beta',
    owner: 'Checkout',
    description:
      'Creates a payment intent that tracks a payment through authentication, ' +
      'authorization, and capture. Replaces the direct charges flow for ' +
      'SCA-regulated markets; currently gated to beta accounts.',
    auth: 'Secret key (Bearer)',
    rateLimit: '300 req/min per key',
    cache: 'None (mutating)',
    regions: 'us-east-1 · eu-west-1',
    release: 'v2026-06-30.1 · deployed Jun 30, 2026',
    slo: 'Beta · no SLO commitment',
    related: [
      {method: 'POST', path: '/v1/charges', note: 'Legacy direct-charge flow'},
    ],
  },
  {
    id: 'balance-transactions-get',
    method: 'GET',
    path: '/v1/balance_transactions',
    requests: '421,730',
    errorRate: '0.11%',
    p95: '132 ms',
    status: 'live',
    owner: 'Ledger',
    description:
      'Lists ledger entries that make up the account balance: charges, ' +
      'refunds, fees, and payouts. Supports cursor pagination up to 100 ' +
      'entries per page and filtering by created range or source object.',
    auth: 'Secret or restricted key',
    rateLimit: '600 req/min per key',
    cache: '60 s edge cache (private)',
    regions: 'us-east-1 · eu-west-1',
    release: 'v2026-06-21.2 · deployed Jun 21, 2026',
    slo: '99.95% availability · P95 < 200 ms',
    related: [
      {method: 'GET', path: '/v1/charges/:id', note: 'Source object for entries'},
    ],
  },
  {
    id: 'webhooks-test-post',
    method: 'POST',
    path: '/v1/webhooks/test',
    requests: '18,046',
    errorRate: '4.62%',
    p95: '1,280 ms',
    status: 'degraded',
    owner: 'Platform',
    description:
      'Sends a signed test event to a registered webhook endpoint and reports ' +
      'the delivery result inline. Currently degraded: deliveries to ' +
      'eu-west-1 consumers are retrying due to elevated upstream timeouts.',
    auth: 'Secret key (Bearer)',
    rateLimit: '60 req/min per key',
    cache: 'None (mutating)',
    regions: 'us-east-1 · eu-west-1',
    release: 'v2026-05-30.4 · deployed May 30, 2026',
    slo: '99.9% availability · P95 < 800 ms',
    related: [],
  },
  {
    id: 'tokens-delete',
    method: 'DELETE',
    path: '/v1/tokens/:id',
    requests: '2,310',
    errorRate: '0.02%',
    p95: '61 ms',
    status: 'deprecated',
    owner: 'Identity',
    description:
      'Detaches and invalidates a saved card token. Deprecated in favor of ' +
      'payment-method detachment; existing integrations continue to work ' +
      'until the 2027-01-01 sunset date announced in the changelog.',
    auth: 'Secret key (Bearer)',
    rateLimit: '120 req/min per key',
    cache: 'None (mutating)',
    regions: 'us-east-1',
    release: 'v2025-11-08.2 · deployed Nov 8, 2025',
    slo: 'Deprecated · best effort',
    related: [
      {method: 'GET', path: '/v1/customers/:id', note: 'Replacement detach flow'},
    ],
  },
];

// Toggle column + 6 data columns; the detail cell spans all of them.
const COLUMN_COUNT = 7;

// ============= ROW COMPONENTS =============

/** Method + path pair used in the main row and in related-endpoint chips. */
function EndpointSignature({method, path}: {method: Method; path: string}) {
  return (
    <HStack gap={2} vAlign="center">
      <Badge label={method} variant={METHOD_VARIANT[method]} />
      <Code>{path}</Code>
    </HStack>
  );
}

/** Full-span detail region rendered beneath an expanded row. */
function EndpointDetailRow({endpoint}: {endpoint: ApiEndpoint}) {
  return (
    <TableRow id={`endpoint-detail-${endpoint.id}`}>
      <TableCell colSpan={COLUMN_COUNT} style={styles.detailCell}>
        <div style={styles.detailBody}>
          <VStack gap={4}>
            <Text type="body" color="secondary">
              {endpoint.description}
            </Text>
            <MetadataList columns="multi" label={{position: 'top'}}>
              <MetadataListItem label="Authentication">
                {endpoint.auth}
              </MetadataListItem>
              <MetadataListItem label="Rate limit">
                {endpoint.rateLimit}
              </MetadataListItem>
              <MetadataListItem label="Cache">{endpoint.cache}</MetadataListItem>
              <MetadataListItem label="Regions">
                {endpoint.regions}
              </MetadataListItem>
              <MetadataListItem label="Release">
                {endpoint.release}
              </MetadataListItem>
              <MetadataListItem label="SLO">{endpoint.slo}</MetadataListItem>
            </MetadataList>
            {endpoint.related.length === 0 ? null : (
              <VStack gap={2}>
                <Text type="label">Related endpoints</Text>
                <HStack gap={4} wrap="wrap" vAlign="center">
                  {endpoint.related.map(related => (
                    <HStack
                      key={`${related.method} ${related.path}`}
                      gap={2}
                      vAlign="center">
                      <EndpointSignature
                        method={related.method}
                        path={related.path}
                      />
                      <Text type="supporting" color="secondary">
                        {related.note}
                      </Text>
                    </HStack>
                  ))}
                </HStack>
              </VStack>
            )}
            <HStack gap={2} wrap="wrap">
              <Button
                label="View logs"
                size="sm"
                variant="secondary"
                icon={<Icon icon={MagnifyingGlassIcon} size="sm" />}
              />
              <Button
                label="Open runbook"
                size="sm"
                variant="ghost"
                icon={<Icon icon={BookmarkIcon} size="sm" />}
              />
            </HStack>
          </VStack>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ============= PAGE =============

export default function TableInlineExpansionTemplate() {
  // Ids of rows whose detail region is open. Seeded with one expanded row
  // so the template shows the pattern without interaction. Toggling clones
  // the Set so React sees a new reference.
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(['charges-post']),
  );

  const toggleRow = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allExpanded = expandedIds.size === ENDPOINTS.length;
  const toggleAll = () => {
    setExpandedIds(
      allExpanded ? new Set() : new Set(ENDPOINTS.map(item => item.id)),
    );
  };

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Endpoint registry</Heading>
                <Text type="supporting" color="secondary">
                  {ENDPOINTS.length} routes · production gateway
                </Text>
              </HStack>
            </StackItem>
            <Button
              label={allExpanded ? 'Collapse all' : 'Expand all'}
              variant="ghost"
              onClick={toggleAll}
            />
            <Button
              label="New endpoint"
              icon={<Icon icon={PlusIcon} size="sm" />}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <Table<Record<string, unknown>> density="balanced" dividers="rows">
            <TableHeader>
              <TableRow isHeaderRow>
                {/* Leading toggle column has no header label. */}
                <TableHeaderCell style={styles.toggleHeader} />
                <TableHeaderCell>Endpoint</TableHeaderCell>
                <TableHeaderCell style={{...styles.numeric, width: 140}}>
                  Requests (24h)
                </TableHeaderCell>
                <TableHeaderCell style={{...styles.numeric, width: 110}}>
                  Error rate
                </TableHeaderCell>
                <TableHeaderCell style={{...styles.numeric, width: 100}}>
                  P95
                </TableHeaderCell>
                <TableHeaderCell style={{width: 120}}>Status</TableHeaderCell>
                <TableHeaderCell style={{width: 150}}>Owner</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENDPOINTS.map(endpoint => {
                const isExpanded = expandedIds.has(endpoint.id);
                const status = STATUS_META[endpoint.status];
                return [
                  <TableRow key={endpoint.id}>
                    <TableCell>
                      <IconButton
                        label={
                          isExpanded
                            ? `Collapse details for ${endpoint.method} ${endpoint.path}`
                            : `Expand details for ${endpoint.method} ${endpoint.path}`
                        }
                        // Plus/XMark stand in for ChevronRight/ChevronDown,
                        // which the local heroicons shim does not export.
                        icon={
                          <Icon
                            icon={isExpanded ? XMarkIcon : PlusIcon}
                            size="sm"
                          />
                        }
                        variant="ghost"
                        size="sm"
                        aria-expanded={isExpanded}
                        aria-controls={
                          isExpanded
                            ? `endpoint-detail-${endpoint.id}`
                            : undefined
                        }
                        onClick={() => toggleRow(endpoint.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <EndpointSignature
                        method={endpoint.method}
                        path={endpoint.path}
                      />
                    </TableCell>
                    <TableCell style={styles.numeric}>
                      <Text type="body">{endpoint.requests}</Text>
                    </TableCell>
                    <TableCell style={styles.numeric}>
                      <Text type="body">{endpoint.errorRate}</Text>
                    </TableCell>
                    <TableCell style={styles.numeric}>
                      <Text type="body">{endpoint.p95}</Text>
                    </TableCell>
                    <TableCell>
                      <Badge label={status.label} variant={status.variant} />
                    </TableCell>
                    <TableCell>
                      <Text type="body">{endpoint.owner}</Text>
                    </TableCell>
                  </TableRow>,
                  isExpanded ? (
                    <EndpointDetailRow
                      key={`${endpoint.id}-detail`}
                      endpoint={endpoint}
                    />
                  ) : null,
                ];
              })}
            </TableBody>
          </Table>
        </LayoutContent>
      }
    />
  );
}
