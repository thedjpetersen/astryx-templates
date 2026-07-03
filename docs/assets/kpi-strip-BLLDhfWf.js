var e=`'use client';

import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const metrics = [
  {
    label: 'Pipeline',
    value: '$428K',
    detail: '+12.4% this week',
    status: 'On track',
    variant: 'success' as const,
  },
  {
    label: 'Open work',
    value: '184',
    detail: '23 blocked',
    status: 'Review',
    variant: 'warning' as const,
  },
  {
    label: 'SLA risk',
    value: '7',
    detail: '2 due today',
    status: 'Action',
    variant: 'error' as const,
  },
];

export default function KpiStrip() {
  return (
    <Grid columns={{minWidth: 220, repeat: 'fit'}} gap={3}>
      {metrics.map(metric => (
        <Card key={metric.label} padding={3}>
          <Stack direction="vertical" gap={3}>
            <Stack direction="horizontal" hAlign="between" gap={3}>
              <Text type="supporting" color="secondary">
                {metric.label}
              </Text>
              <Badge label={metric.status} variant={metric.variant} />
            </Stack>
            <Stack direction="vertical" gap={1}>
              <Text type="display-2" hasTabularNumbers>
                {metric.value}
              </Text>
              <Text type="body" color="secondary" hasTabularNumbers>
                {metric.detail}
              </Text>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}

`;export{e as default};