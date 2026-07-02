// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Search Results Page — developer-docs search surface for "Corestack",
 * a payments/events platform. Header carries the docs brand plus a prominent
 * search input pre-filled with the fixture query "webhook retries". A start
 * LayoutPanel holds three CheckboxList facets (content type, product area,
 * last updated) with corpus counts. LayoutContent renders the ranked result
 * list — Token type chip + breadcrumb, Link title, snippet with the query
 * terms highlighted, and a metadata row — with a sort Selector up top.
 * LayoutFooter carries the Pagination (page numbers + page-size selector).
 *
 * @input Fixed fixtures only: a 16-document result corpus for the query
 *   "webhook retries" with pre-assigned relevance order, pre-formatted
 *   "Updated <date>" strings, and precomputed recency buckets (no clocks,
 *   no randomness). Facet selections, sort order, page, and page size live
 *   in useState; every control re-slices the same fixture corpus.
 * @output A full-height search results page: header search bar, faceted
 *   filter rail, ranked snippet list with term highlighting, and a
 *   pagination footer. EmptyState appears when facets exclude everything.
 * @position Emitted by `astryx template search-results`.
 *
 * Responsive contract:
 * - >768px: 260px facet rail as a start LayoutPanel; header brand + search
 *   input share one row (input fills remaining width); footer shows the
 *   "Showing a–b of n" summary beside the pagination controls.
 * - <=768px: the facet rail hides; an inline supporting row above the
 *   results shows the active-filter count with a "Clear filters" link so
 *   applied facets are never invisible or stuck. The header stacks: brand
 *   on the first row, search input + button full-width on the second. The
 *   footer drops the range summary and keeps only the pagination controls.
 * - Snippets clamp to 2 lines and titles to 1 line at every width; the
 *   result list scrolls inside LayoutContent while header/footer stay put.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  VStack,
  HStack,
  StackItem,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {Pagination} from '@astryxdesign/core/Pagination';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

// ============= STYLES =============
// Plain inline styles using Astryx design-token CSS variables (declared at
// :root by `@astryxdesign/core/astryx.css`). No StyleX compiler required.

const styles: Record<string, CSSProperties> = {
  // Highlighted query term inside a snippet. Overrides the browser's
  // default yellow <mark> with token colors so it reads as emphasis,
  // not annotation.
  mark: {
    backgroundColor: 'var(--color-accent-muted)',
    color: 'inherit',
    borderRadius: 2,
    padding: '0 1px',
    fontWeight: 500,
  },
};

// ============= DATA =============
// Deterministic fixtures: the corpus below is the fixed result set for the
// fixture query. Relevance rank is array order; "newest" sorts on the
// pre-formatted ISO date strings. Recency buckets are precomputed so no
// clock is consulted at render time.

const QUERY = 'webhook retries';

// Matches the query's stems (webhook/webhooks, retry/retries/retried/
// retrying). The capture group keeps matches in the split output.
const HIGHLIGHT_SPLIT = /(webhooks?|retr(?:y|ies|ied|ying))/gi;
const HIGHLIGHT_TEST = /^(?:webhooks?|retr(?:y|ies|ied|ying))$/i;

type ContentType = 'guide' | 'api' | 'runbook' | 'changelog' | 'community';
type Recency = 'd30' | 'd90' | 'y1' | 'older';
type TokenColor = 'blue' | 'purple' | 'orange' | 'teal' | 'green';

interface SearchResult {
  id: string;
  title: string;
  breadcrumb: string;
  snippet: string;
  type: ContentType;
  product: string;
  recency: Recency;
  /** ISO date used for the "Most recent" sort. */
  updatedISO: string;
  /** Pre-formatted metadata row: updated date, engagement figure. */
  meta: string;
}

const TYPE_META: Record<ContentType, {label: string; color: TokenColor}> = {
  guide: {label: 'Guide', color: 'blue'},
  api: {label: 'API reference', color: 'purple'},
  runbook: {label: 'Runbook', color: 'orange'},
  changelog: {label: 'Changelog', color: 'teal'},
  community: {label: 'Community Q&A', color: 'green'},
};

const TYPE_ORDER: ContentType[] = [
  'guide',
  'api',
  'runbook',
  'changelog',
  'community',
];

const PRODUCTS = ['Events', 'Payments', 'Connect', 'Platform'];

const RECENCY_OPTIONS: Array<{value: Recency; label: string}> = [
  {value: 'd30', label: 'Past 30 days'},
  {value: 'd90', label: 'Past 90 days'},
  {value: 'y1', label: 'Past year'},
  {value: 'older', label: 'Older than a year'},
];

const SORT_OPTIONS = [
  {value: 'relevance', label: 'Most relevant'},
  {value: 'recent', label: 'Most recent'},
];

const PAGE_SIZES = [5, 10, 25];

// Ranked corpus for the fixture query. Array order = relevance order.
const RESULTS: SearchResult[] = [
  {
    id: 'r-01',
    title: 'Retry behavior for webhook deliveries',
    breadcrumb: 'Docs › Events › Webhooks',
    snippet:
      'Failed webhook deliveries are retried with exponential backoff for up to 72 hours. Configure per-endpoint retry policies from the dashboard or set retry_policy when creating the endpoint.',
    type: 'guide',
    product: 'Events',
    recency: 'd30',
    updatedISO: '2026-06-18',
    meta: 'Updated Jun 18, 2026 · 12.4k views',
  },
  {
    id: 'r-02',
    title: 'Webhook Endpoints API',
    breadcrumb: 'API › Events › webhook_endpoints',
    snippet:
      'POST /v1/webhook_endpoints creates an endpoint. The retry_policy object controls max attempts (default 16), backoff multiplier, and whether retries pause after ten consecutive 410 responses.',
    type: 'api',
    product: 'Events',
    recency: 'd30',
    updatedISO: '2026-06-09',
    meta: 'Updated Jun 9, 2026 · 9.1k views',
  },
  {
    id: 'r-03',
    title: 'Best practices for consuming webhooks',
    breadcrumb: 'Docs › Events › Webhooks',
    snippet:
      'Return 2xx before doing heavy work, and make handlers idempotent — a retry can deliver the same webhook twice if your first acknowledgement is lost in transit.',
    type: 'guide',
    product: 'Events',
    recency: 'd90',
    updatedISO: '2026-04-22',
    meta: 'Updated Apr 22, 2026 · 18.7k views',
  },
  {
    id: 'r-04',
    title: 'Runbook: webhook delivery backlog',
    breadcrumb: 'Ops › Runbooks › Delivery',
    snippet:
      'When p95 delivery latency exceeds 90 s, drain the retry queue by raising worker concurrency before pausing retries for endpoints with sustained 5xx rates.',
    type: 'runbook',
    product: 'Platform',
    recency: 'd90',
    updatedISO: '2026-05-02',
    meta: 'Updated May 2, 2026 · 2.3k views',
  },
  {
    id: 'r-05',
    title: 'Event delivery attempts',
    breadcrumb: 'API › Events › delivery_attempts',
    snippet:
      'GET /v1/events/{id}/attempts lists every delivery attempt, including each retry, with the response code, latency, and the next scheduled attempt time.',
    type: 'api',
    product: 'Events',
    recency: 'd30',
    updatedISO: '2026-06-11',
    meta: 'Updated Jun 11, 2026 · 6.8k views',
  },
  {
    id: 'r-06',
    title: 'Configurable retry schedules for webhook endpoints',
    breadcrumb: 'Changelog › May 2026',
    snippet:
      'You can now override the default backoff curve per endpoint. Retries can be capped at any count from 1 to 32, or disabled entirely for fire-and-forget webhooks.',
    type: 'changelog',
    product: 'Events',
    recency: 'd90',
    updatedISO: '2026-05-27',
    meta: 'Published May 27, 2026 · release 2026.21',
  },
  {
    id: 'r-07',
    title: 'Why did my payment webhook retry 27 times?',
    breadcrumb: 'Community › Payments',
    snippet:
      'Our endpoint returned 301 redirects, and every retry followed the same schedule. Turns out redirects are treated as failures — webhooks must respond 2xx at the registered URL.',
    type: 'community',
    product: 'Payments',
    recency: 'd90',
    updatedISO: '2026-04-30',
    meta: 'Answered Apr 30, 2026 · 14 answers',
  },
  {
    id: 'r-08',
    title: 'Payment status webhooks',
    breadcrumb: 'Docs › Payments › Webhooks',
    snippet:
      'Subscribe to payment_intent.succeeded and payment_intent.failed. Deliveries that hit a 5xx are retried on the standard schedule; disputes use a separate webhook topic.',
    type: 'guide',
    product: 'Payments',
    recency: 'd30',
    updatedISO: '2026-06-15',
    meta: 'Updated Jun 15, 2026 · 21.2k views',
  },
  {
    id: 'r-09',
    title: 'Connect platform webhooks',
    breadcrumb: 'API › Connect › webhooks',
    snippet:
      'account.updated events fan out to every connected account endpoint. Each account gets an independent retry budget so one failing endpoint never starves the rest.',
    type: 'api',
    product: 'Connect',
    recency: 'y1',
    updatedISO: '2025-11-08',
    meta: 'Updated Nov 8, 2025 · 4.5k views',
  },
  {
    id: 'r-10',
    title: 'Runbook: replaying dead-lettered webhooks',
    breadcrumb: 'Ops › Runbooks › Delivery',
    snippet:
      'After retries are exhausted, events land in the dead-letter queue for 30 days. Use corestack events replay --endpoint to bulk re-deliver without minting duplicate event IDs.',
    type: 'runbook',
    product: 'Events',
    recency: 'y1',
    updatedISO: '2025-09-19',
    meta: 'Updated Sep 19, 2025 · 1.9k views',
  },
  {
    id: 'r-11',
    title: 'Does webhook retry backoff include jitter?',
    breadcrumb: 'Community › Events',
    snippet:
      'Yes — each retry adds up to 20% random jitter to the backoff interval so herds of failed webhooks do not synchronize against a recovering endpoint.',
    type: 'community',
    product: 'Events',
    recency: 'y1',
    updatedISO: '2025-12-03',
    meta: 'Answered Dec 3, 2025 · 8 answers',
  },
  {
    id: 'r-12',
    title: 'Verifying webhook signatures',
    breadcrumb: 'Docs › Platform › Security',
    snippet:
      'Verify the signature header on every delivery, including retries — each retry is re-signed with a fresh timestamp, and the default tolerance window is five minutes.',
    type: 'guide',
    product: 'Platform',
    recency: 'd90',
    updatedISO: '2026-04-07',
    meta: 'Updated Apr 7, 2026 · 15.6k views',
  },
  {
    id: 'r-13',
    title: 'Retry attempt headers on webhook requests',
    breadcrumb: 'Changelog › March 2026',
    snippet:
      'Every delivery now carries X-Corestack-Retry-Count and X-Corestack-First-Attempt headers so handlers can distinguish an original webhook from a retried one.',
    type: 'changelog',
    product: 'Platform',
    recency: 'd90',
    updatedISO: '2026-03-12',
    meta: 'Published Mar 12, 2026 · release 2026.10',
  },
  {
    id: 'r-14',
    title: 'Refund webhooks',
    breadcrumb: 'API › Payments › refunds',
    snippet:
      'refund.updated fires on every state change. Deliveries follow the standard retry schedule; use the balance transaction ID as your idempotency key when reconciling.',
    type: 'api',
    product: 'Payments',
    recency: 'y1',
    updatedISO: '2025-10-14',
    meta: 'Updated Oct 14, 2025 · 5.2k views',
  },
  {
    id: 'r-15',
    title: 'Endpoint disabled after retries exhausted — how to recover?',
    breadcrumb: 'Community › Connect',
    snippet:
      'Corestack disables an endpoint after seven days of failed retries. Re-enable it from the dashboard, then replay the dead-lettered webhooks from the delivery tab.',
    type: 'community',
    product: 'Connect',
    recency: 'older',
    updatedISO: '2024-08-21',
    meta: 'Answered Aug 21, 2024 · 5 answers',
  },
  {
    id: 'r-16',
    title: 'Testing webhooks locally',
    breadcrumb: 'Docs › Events › Development',
    snippet:
      'Forward events to localhost with corestack listen, then trigger a synthetic retry with corestack events resend to exercise your handler’s duplicate-delivery path.',
    type: 'guide',
    product: 'Events',
    recency: 'older',
    updatedISO: '2024-06-02',
    meta: 'Updated Jun 2, 2024 · 27.9k views',
  },
];

// ============= HELPERS =============

/** Counts corpus documents by an arbitrary key (facet counts). */
function countBy(pick: (result: SearchResult) => string) {
  const counts: Record<string, number> = {};
  for (const result of RESULTS) {
    const key = pick(result);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

const TYPE_COUNTS = countBy(result => result.type);
const PRODUCT_COUNTS = countBy(result => result.product);
const RECENCY_COUNTS = countBy(result => result.recency);

/** Wraps query-term matches in a token-styled <mark>. */
function renderSnippet(snippet: string): ReactNode {
  return snippet.split(HIGHLIGHT_SPLIT).map((part, index) =>
    HIGHLIGHT_TEST.test(part) ? (
      <mark key={index} style={styles.mark}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

// ============= RESULT ROW =============

function ResultRow({result}: {result: SearchResult}) {
  const typeMeta = TYPE_META[result.type];
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <Token label={typeMeta.label} color={typeMeta.color} size="sm" />
        <Text type="supporting" color="secondary" maxLines={1}>
          {result.breadcrumb}
        </Text>
      </HStack>
      <Link href="#" size="lg" weight="medium" maxLines={1} isStandalone>
        {result.title}
      </Link>
      <Text type="body" color="secondary" maxLines={2}>
        {renderSnippet(result.snippet)}
      </Text>
      <Text type="supporting" color="secondary" maxLines={1}>
        {result.meta}
      </Text>
    </VStack>
  );
}

// ============= PAGE =============

export default function SearchResultsPage() {
  const [query, setQuery] = useState(QUERY);
  const [typeSel, setTypeSel] = useState<string[]>([]);
  const [productSel, setProductSel] = useState<string[]>([]);
  const [recencySel, setRecencySel] = useState<string[]>([]);
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const isCompact = useMediaQuery('(max-width: 768px)');

  // Facet/sort changes jump back to page 1 so the slice never strands the
  // user on a page past the end of a narrowed result set.
  const applyFacet =
    (setter: (values: string[]) => void) => (values: string[]) => {
      setter(values);
      setPage(1);
    };

  const clearFilters = () => {
    setTypeSel([]);
    setProductSel([]);
    setRecencySel([]);
    setPage(1);
  };

  const activeFilterCount =
    typeSel.length + productSel.length + recencySel.length;

  // Empty facet selection = facet not applied (standard search semantics).
  const visibleResults = useMemo(() => {
    const matches = RESULTS.filter(
      result =>
        (typeSel.length === 0 || typeSel.includes(result.type)) &&
        (productSel.length === 0 || productSel.includes(result.product)) &&
        (recencySel.length === 0 || recencySel.includes(result.recency)),
    );
    if (sort === 'recent') {
      return [...matches].sort((a, b) =>
        b.updatedISO.localeCompare(a.updatedISO),
      );
    }
    return matches; // corpus order = relevance rank
  }, [typeSel, productSel, recencySel, sort]);

  // Clamp rather than trust `page` blindly — pageSize changes can shrink
  // the page count without going through a facet handler.
  const totalPages = Math.max(1, Math.ceil(visibleResults.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageResults = visibleResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, visibleResults.length);

  // Facet counts reflect the whole corpus (not the filtered set), matching
  // the common search-facet convention.
  const facetRail = (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label">Filters</Text>
        </StackItem>
        {activeFilterCount > 0 && (
          <Link onClick={clearFilters} type="supporting">
            Clear all
          </Link>
        )}
      </HStack>
      <CheckboxList
        label="Content type"
        value={typeSel}
        onChange={applyFacet(setTypeSel)}
        density="compact">
        {TYPE_ORDER.map(type => (
          <CheckboxListItem
            key={type}
            value={type}
            label={TYPE_META[type].label}
            endContent={<Badge label={String(TYPE_COUNTS[type] ?? 0)} />}
          />
        ))}
      </CheckboxList>
      <Divider />
      <CheckboxList
        label="Product area"
        value={productSel}
        onChange={applyFacet(setProductSel)}
        density="compact">
        {PRODUCTS.map(product => (
          <CheckboxListItem
            key={product}
            value={product}
            label={product}
            endContent={<Badge label={String(PRODUCT_COUNTS[product] ?? 0)} />}
          />
        ))}
      </CheckboxList>
      <Divider />
      <CheckboxList
        label="Last updated"
        value={recencySel}
        onChange={applyFacet(setRecencySel)}
        density="compact">
        {RECENCY_OPTIONS.map(option => (
          <CheckboxListItem
            key={option.value}
            value={option.value}
            label={option.label}
            endContent={
              <Badge label={String(RECENCY_COUNTS[option.value] ?? 0)} />
            }
          />
        ))}
      </CheckboxList>
    </VStack>
  );

  const searchInput = (
    <TextInput
      label="Search documentation"
      isLabelHidden
      value={query}
      onChange={setQuery}
      placeholder="Search guides, API reference, and runbooks..."
      startIcon={<Icon icon={MagnifyingGlassIcon} size="sm" />}
      hasClear
      size="lg"
      width="100%"
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {/* Compact screens stack the brand above a full-width search row
              (deterministic, rather than relying on flex-wrap). */}
          {isCompact ? (
            <VStack gap={2}>
              <Heading level={1}>Corestack Docs</Heading>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">{searchInput}</StackItem>
                <Button label="Search" variant="primary" />
              </HStack>
            </VStack>
          ) : (
            <HStack gap={3} vAlign="center">
              <Heading level={1}>Corestack Docs</Heading>
              <StackItem size="fill">{searchInput}</StackItem>
              <Button label="Search" variant="primary" />
            </HStack>
          )}
        </LayoutHeader>
      }
      start={
        isCompact ? undefined : (
          <LayoutPanel width={260} padding={3} hasDivider label="Search filters">
            {facetRail}
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={4} label="Search results">
          <VStack gap={4}>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  {visibleResults.length} results for “{QUERY}” · 0.31 s
                </Text>
              </StackItem>
              <Selector
                label="Sort results"
                isLabelHidden
                size="sm"
                options={SORT_OPTIONS}
                value={sort}
                onChange={value => {
                  setSort(value);
                  setPage(1);
                }}
              />
            </HStack>
            {/* Facet rail is hidden on compact screens; keep applied
                filters visible (and escapable) with an inline summary. */}
            {isCompact && activeFilterCount > 0 && (
              <HStack gap={2} vAlign="center">
                <Text type="supporting" color="secondary">
                  {activeFilterCount}{' '}
                  {activeFilterCount === 1 ? 'filter' : 'filters'} applied
                </Text>
                <Link onClick={clearFilters} type="supporting">
                  Clear filters
                </Link>
              </HStack>
            )}
            {pageResults.length === 0 ? (
              <EmptyState
                icon={<Icon icon={MagnifyingGlassIcon} size="lg" />}
                title="No results match your filters"
                description="Every document for this query is excluded by the current facet selection."
                actions={
                  <Button
                    label="Clear filters"
                    variant="secondary"
                    onClick={clearFilters}
                  />
                }
              />
            ) : (
              <VStack gap={4}>
                {pageResults.map((result, index) => (
                  <VStack key={result.id} gap={4}>
                    {index > 0 && <Divider />}
                    <ResultRow result={result} />
                  </VStack>
                ))}
              </VStack>
            )}
          </VStack>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              {/* Compact screens keep only the pagination controls. */}
              {!isCompact && (
                <Text type="supporting" color="secondary">
                  {visibleResults.length === 0
                    ? 'No results'
                    : `Showing ${rangeStart}–${rangeEnd} of ${visibleResults.length} results`}
                </Text>
              )}
            </StackItem>
            <Pagination
              label="Search results pages"
              page={currentPage}
              onChange={setPage}
              totalItems={visibleResults.length}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZES}
              onPageSizeChange={size => {
                setPageSize(size);
                setPage(1);
              }}
              size="sm"
            />
          </HStack>
        </LayoutFooter>
      }
    />
  );
}
