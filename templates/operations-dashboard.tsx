'use client';

/**
 * Operations Dashboard — work queue dashboard with a frame-first shell.
 *
 * Frame: header | KPI row | review queue + action panel.
 *
 * Responsive contract:
 * - KPI row: Grid columns={{minWidth: 220, repeat: 'fit'}}; cards reflow
 *   from three-up to one-up without changing their internal rhythm.
 * - Detail area: Grid columns={{minWidth: 320, repeat: 'fit'}}; the queue
 *   and action panel sit side-by-side when space allows and stack on narrow
 *   screens.
 *
 * Container policy: Cards are used only for dashboard widgets. The queue is
 * rendered as dense rows inside one card rather than a card per item.
 *
 * Fixtures are deterministic: fixed labels and counts, no clocks, no
 * randomness, and no network assets.
 */

import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  Stack,
  StackItem,
} from '@astryxdesign/core/Layout';
import {Stat} from '@astryxdesign/core/Stat';
import {Heading, Text} from '@astryxdesign/core/Text';

const metrics = [
  {
    label: 'Revenue',
    value: '$428K',
    delta: {value: '+12.4%', direction: 'up'},
    status: 'Healthy',
  },
  {
    label: 'Active deals',
    value: '184',
    delta: {value: '+8', direction: 'up'},
    status: 'Queued',
  },
  {
    label: 'At risk',
    value: '7',
    delta: {value: '-3', direction: 'down', sentiment: 'positive'},
    status: 'Review',
  },
] as const;

const queue = [
  {name: 'Enterprise renewal', owner: 'Avery', age: '2h', status: 'Ready'},
  {name: 'Security review', owner: 'Mina', age: '5h', status: 'Blocked'},
  {name: 'Launch checklist', owner: 'Jon', age: '1d', status: 'Queued'},
];

export default function OperationsDashboard() {
  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader>
          <Stack direction="horizontal" hAlign="between" gap={4}>
            <Stack direction="vertical" gap={1}>
              <Text type="supporting" color="secondary">
                Operations
              </Text>
              <Heading level={1}>Command center</Heading>
            </Stack>
            <StackItem>
              <Stack direction="horizontal" gap={2}>
                <Button label="Export" variant="secondary" />
                <Button label="New review" variant="primary" />
              </Stack>
            </StackItem>
          </Stack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <Stack direction="vertical" gap={6}>
            <Grid columns={{minWidth: 220, repeat: 'fit'}} gap={3}>
              {metrics.map(metric => (
                <Card key={metric.label} padding={3}>
                  <Stack direction="horizontal" hAlign="between" gap={3}>
                    <Stat
                      label={metric.label}
                      value={metric.value}
                      delta={metric.delta}
                      description="from previous period"
                    />
                    <Badge label={metric.status} variant="neutral" />
                  </Stack>
                </Card>
              ))}
            </Grid>

            <Grid columns={{minWidth: 320, repeat: 'fit'}} gap={4}>
              <Card padding={4}>
                <Stack direction="vertical" gap={4}>
                  <Stack direction="horizontal" hAlign="between" gap={3}>
                    <Stack direction="vertical" gap={1}>
                      <Heading level={3}>Review queue</Heading>
                      <Text type="supporting" color="secondary">
                        Items that need a decision before the next handoff.
                      </Text>
                    </Stack>
                    <Badge label="3 open" variant="info" />
                  </Stack>
                  <Divider />
                  <Stack direction="vertical" gap={3}>
                    {queue.map(item => (
                      <Stack
                        key={item.name}
                        direction="horizontal"
                        hAlign="between"
                        gap={3}>
                        <Stack direction="vertical" gap={1}>
                          <Text type="body">{item.name}</Text>
                          <Text type="supporting" color="secondary">
                            {item.owner} updated {item.age} ago
                          </Text>
                        </Stack>
                        <Badge
                          label={item.status}
                          variant={
                            item.status === 'Blocked' ? 'warning' : 'neutral'
                          }
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              <Card padding={4}>
                <Stack direction="vertical" gap={4}>
                  <Stack direction="vertical" gap={1}>
                    <Heading level={3}>Next actions</Heading>
                    <Text type="supporting" color="secondary">
                      Keep the working set small and clear.
                    </Text>
                  </Stack>
                  <Divider />
                  <Stack direction="vertical" gap={3}>
                    <Text type="body">Assign owner for blocked security review.</Text>
                    <Text type="body">Confirm launch checklist dependencies.</Text>
                    <Text type="body">Send renewal summary to account team.</Text>
                  </Stack>
                  <Button label="Open workspace" variant="primary" />
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </LayoutContent>
      }
    />
  );
}
