// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (five days of checkout-service activity:
 *   deploys, alerts, comments, and config changes with fixed ISO timestamps)
 * @output Service activity timeline: header with an event-type
 *   SegmentedControl filter, a centered chronological feed grouped under
 *   sticky date headers, each event an icon marker on a connector rail with
 *   an actor Avatar, Timestamp, and optional detail Card (deploy status,
 *   alert summary, or quoted comment)
 * @position Page template; emitted by `astryx template timeline`
 *
 * Responsive contract:
 * - Feed column: max-width 720px, centered; below that it takes the full
 *   width inside the content padding. The connector-rail gutter keeps its
 *   fixed width at every breakpoint so markers stay vertically aligned.
 * - >640px: header is one row — title + event count left, the type filter
 *   pinned right. Each event pins its Timestamp to the right of the title
 *   line.
 * - <=640px: header stacks (filter drops below the title) and each event's
 *   Timestamp wraps under the title instead of pinning right, so long event
 *   titles keep the full row width.
 * - Date headers are sticky inside the scrolling content, so the group in
 *   view stays labeled while the feed scrolls.
 */

import {useMemo, useState, type CSSProperties, type ComponentType, type SVGProps} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Card} from '@astryxdesign/core/Card';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import type {TokenColor} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  BellRingIcon,
  InboxIcon,
  MessagesSquareIcon,
  RocketIcon,
  SettingsIcon,
  SquarePenIcon,
  UserPlusIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered reading column; the rail gutter lives inside it.
  feed: {
    maxWidth: 720,
    margin: '0 auto',
  },
  // Sticky date header so the group in view stays labeled while scrolling.
  dateHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: 'var(--color-background)',
    padding: 'var(--spacing-2) 0',
  },
  row: {
    display: 'flex',
    gap: 'var(--spacing-3)',
  },
  // Fixed-width gutter: marker circle on top, connector line filling below.
  gutter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: 28,
  },
  marker: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  connector: {
    flex: 1,
    width: 2,
    marginTop: 'var(--spacing-1)',
    backgroundColor: 'var(--color-border)',
    borderRadius: 1,
  },
  body: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 'var(--spacing-5)',
  },
  bodyLast: {
    paddingBottom: 'var(--spacing-2)',
  },
};

// ============= DATA =============

type EventType = 'deploy' | 'alert' | 'comment' | 'change';
type MarkerColor = 'success' | 'error' | 'warning' | 'accent' | 'secondary';

// Optional detail rendered as a Card under the title line.
type EventDetail =
  | {
      kind: 'status';
      dot: {variant: 'success' | 'error' | 'warning' | 'neutral'; label: string};
      headline: string;
      meta: string;
      tokens: ReadonlyArray<{label: string; color: TokenColor}>;
    }
  | {kind: 'quote'; text: string};

interface TimelineEvent {
  id: string;
  type: EventType;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor: MarkerColor;
  actor: string;
  action: string;
  time: string; // fixed ISO timestamp
  detail?: EventDetail;
}

const FILTERS: ReadonlyArray<{value: string; label: string}> = [
  {value: 'all', label: 'All'},
  {value: 'deploy', label: 'Deploys'},
  {value: 'alert', label: 'Alerts'},
  {value: 'comment', label: 'Comments'},
  {value: 'change', label: 'Changes'},
];

// Newest day first; events within a day are newest first, matching how the
// team scans the feed ("what just happened?").
const DAYS: ReadonlyArray<{
  id: string;
  label: string;
  events: TimelineEvent[];
}> = [
  {
    id: '2026-06-30',
    label: 'Tuesday, June 30',
    events: [
      {
        id: 'evt-1042',
        type: 'alert',
        icon: BellRingIcon,
        iconColor: 'error',
        actor: 'Orbit Monitor',
        action: 'triggered alert "Checkout API error rate above 2%"',
        time: '2026-06-30T16:42:00Z',
        detail: {
          kind: 'status',
          dot: {variant: 'error', label: 'Alert firing'},
          headline: 'Error rate hit 2.7% on POST /v2/payments/confirm',
          meta: 'Fired 16:42 · paged on-call (Tomás Herrera) · INC-2291 opened',
          tokens: [
            {label: 'sev-2', color: 'red'},
            {label: 'production', color: 'gray'},
          ],
        },
      },
      {
        id: 'evt-1041',
        type: 'deploy',
        icon: RocketIcon,
        iconColor: 'success',
        actor: 'Maya Lindqvist',
        action: 'deployed checkout-api v2.14.3 to production',
        time: '2026-06-30T15:58:00Z',
        detail: {
          kind: 'status',
          dot: {variant: 'success', label: 'Deploy healthy'},
          headline: 'Fix double-charge retry on 3DS timeout (#487)',
          meta: 'Build #4821 · 6m 24s · rolled out to 12/12 pods',
          tokens: [{label: 'production', color: 'gray'}],
        },
      },
      {
        id: 'evt-1040',
        type: 'comment',
        icon: MessagesSquareIcon,
        iconColor: 'accent',
        actor: 'Daniel Okafor',
        action: 'commented on incident INC-2291',
        time: '2026-06-30T14:07:00Z',
        detail: {
          kind: 'quote',
          text: 'Error spike lines up with the PSP’s maintenance window, not our 15:58 deploy. Holding the rollback; watching the retry queue drain.',
        },
      },
      {
        id: 'evt-1039',
        type: 'change',
        icon: SettingsIcon,
        iconColor: 'secondary',
        actor: 'Maya Lindqvist',
        action: 'increased rollout flag checkout.express-pay from 25% to 50%',
        time: '2026-06-30T11:32:00Z',
      },
    ],
  },
  {
    id: '2026-06-29',
    label: 'Monday, June 29',
    events: [
      {
        id: 'evt-1036',
        type: 'deploy',
        icon: RocketIcon,
        iconColor: 'success',
        actor: 'Rachel Steinberg',
        action: 'deployed checkout-api v2.14.2 to production',
        time: '2026-06-29T17:20:00Z',
        detail: {
          kind: 'status',
          dot: {variant: 'success', label: 'Deploy healthy'},
          headline: 'Add idempotency keys to wallet top-up endpoint (#481)',
          meta: 'Build #4809 · 5m 51s · rolled out to 12/12 pods',
          tokens: [{label: 'production', color: 'gray'}],
        },
      },
      {
        id: 'evt-1035',
        type: 'change',
        icon: UserPlusIcon,
        iconColor: 'secondary',
        actor: 'Daniel Okafor',
        action: 'added Tomás Herrera to the checkout on-call rotation',
        time: '2026-06-29T13:05:00Z',
      },
      {
        id: 'evt-1034',
        type: 'comment',
        icon: MessagesSquareIcon,
        iconColor: 'accent',
        actor: 'Tomás Herrera',
        action: 'commented on pull request #482',
        time: '2026-06-29T10:48:00Z',
        detail: {
          kind: 'quote',
          text: 'The retry budget belongs in config, not a constant — we’ll want to tune it per region once EU traffic ramps.',
        },
      },
    ],
  },
  {
    id: '2026-06-26',
    label: 'Friday, June 26',
    events: [
      {
        id: 'evt-1029',
        type: 'alert',
        icon: BellRingIcon,
        iconColor: 'warning',
        actor: 'Orbit Monitor',
        action: 'triggered alert "P95 latency above 800 ms" (auto-resolved)',
        time: '2026-06-26T19:14:00Z',
        detail: {
          kind: 'status',
          dot: {variant: 'warning', label: 'Alert auto-resolved'},
          headline: 'P95 peaked at 872 ms during the nightly settlement batch',
          meta: 'Fired 19:14 · resolved 19:26 · no page sent',
          tokens: [
            {label: 'sev-3', color: 'orange'},
            {label: 'production', color: 'gray'},
          ],
        },
      },
      {
        id: 'evt-1027',
        type: 'change',
        icon: SquarePenIcon,
        iconColor: 'secondary',
        actor: 'Rachel Steinberg',
        action: 'updated the runbook "Checkout rollback procedure"',
        time: '2026-06-26T15:31:00Z',
      },
      {
        id: 'evt-1025',
        type: 'deploy',
        icon: RocketIcon,
        iconColor: 'success',
        actor: 'Maya Lindqvist',
        action: 'deployed checkout-worker v1.9.0 to production',
        time: '2026-06-26T09:12:00Z',
        detail: {
          kind: 'status',
          dot: {variant: 'success', label: 'Deploy healthy'},
          headline: 'Batch refund processing for partial cancellations (#474)',
          meta: 'Build #4796 · 4m 02s · rolled out to 6/6 pods',
          tokens: [{label: 'production', color: 'gray'}],
        },
      },
    ],
  },
];

// ============= COMPONENTS =============

function DetailCard({detail}: {detail: EventDetail}) {
  if (detail.kind === 'quote') {
    return (
      <Card variant="muted" padding={3}>
        <Text type="body" color="secondary">
          {detail.text}
        </Text>
      </Card>
    );
  }
  return (
    <Card padding={3}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StatusDot variant={detail.dot.variant} label={detail.dot.label} />
          <StackItem size="fill">
            <Text type="body" maxLines={2}>
              {detail.headline}
            </Text>
          </StackItem>
          {detail.tokens.map(token => (
            <Token
              key={token.label}
              label={token.label}
              color={token.color}
              size="sm"
            />
          ))}
        </HStack>
        <Text type="supporting" color="secondary">
          {detail.meta}
        </Text>
      </VStack>
    </Card>
  );
}

function EventRow({
  event,
  isLast,
  isNarrow,
}: {
  event: TimelineEvent;
  isLast: boolean;
  isNarrow: boolean;
}) {
  const timestamp = (
    <Timestamp value={event.time} format="time" color="secondary" />
  );
  return (
    <div style={styles.row}>
      <div style={styles.gutter}>
        <div style={styles.marker}>
          <Icon icon={event.icon} size="sm" color={event.iconColor} />
        </div>
        {!isLast && <div style={styles.connector} />}
      </div>
      <div style={{...styles.body, ...(isLast ? styles.bodyLast : undefined)}}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Avatar name={event.actor} size="xsmall" />
            <StackItem size="fill">
              <VStack gap={0.5}>
                <Text type="body">
                  <Text weight="semibold" color="inherit">
                    {event.actor}
                  </Text>{' '}
                  {event.action}
                </Text>
                {isNarrow && timestamp}
              </VStack>
            </StackItem>
            {!isNarrow && timestamp}
          </HStack>
          {event.detail && <DetailCard detail={event.detail} />}
        </VStack>
      </div>
    </div>
  );
}

export default function TimelineTemplate() {
  const [typeFilter, setTypeFilter] = useState('all');
  const isNarrow = useMediaQuery('(max-width: 640px)');

  // Apply the type filter per day, dropping days that empty out so no
  // orphaned date header renders.
  const visibleDays = useMemo(() => {
    return DAYS.map(day => ({
      ...day,
      events:
        typeFilter === 'all'
          ? day.events
          : day.events.filter(event => event.type === typeFilter),
    })).filter(day => day.events.length > 0);
  }, [typeFilter]);

  const visibleCount = visibleDays.reduce(
    (total, day) => total + day.events.length,
    0,
  );

  const filterControl = (
    <SegmentedControl
      label="Filter events by type"
      value={typeFilter}
      onChange={setTypeFilter}
      size="sm">
      {FILTERS.map(filter => (
        <SegmentedControlItem
          key={filter.value}
          label={filter.label}
          value={filter.value}
        />
      ))}
    </SegmentedControl>
  );

  const titleBlock = (
    <HStack gap={2} vAlign="center">
      <Heading level={1}>Activity</Heading>
      <Text type="supporting" color="secondary">
        checkout-api · {visibleCount} events · last 5 days
      </Text>
    </HStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {isNarrow ? (
            <VStack gap={2}>
              {titleBlock}
              {filterControl}
            </VStack>
          ) : (
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">{titleBlock}</StackItem>
              {filterControl}
            </HStack>
          )}
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.feed}>
            {visibleDays.length === 0 ? (
              <EmptyState
                icon={<Icon icon={InboxIcon} size="lg" />}
                title="No events"
                description="Nothing in the last 5 days matches this filter."
              />
            ) : (
              visibleDays.map(day => (
                <div key={day.id}>
                  <div style={styles.dateHeader}>
                    <Text type="label" color="secondary">
                      {day.label}
                    </Text>
                  </div>
                  {day.events.map((event, index) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      isLast={index === day.events.length - 1}
                      isNarrow={isNarrow}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </LayoutContent>
      }
    />
  );
}
