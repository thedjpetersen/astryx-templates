import type {ReactNode} from 'react';

import {Stack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';

type Delta = {
  value: string;
  direction: 'up' | 'down' | 'flat';
  sentiment?: 'positive' | 'negative' | 'neutral';
};

export interface StatProps {
  label: string;
  value: string;
  delta?: Delta;
  description?: string;
  media?: ReactNode;
}

function deltaStyle(delta?: Delta) {
  if (!delta) return undefined;
  if (delta.sentiment === 'positive' || delta.direction === 'up') {
    return {color: 'var(--color-success)'};
  }
  if (delta.sentiment === 'negative' || delta.direction === 'down') {
    return {color: 'var(--color-error)'};
  }
  return undefined;
}

export function Stat({label, value, delta, description, media}: StatProps) {
  return (
    <Stack direction="vertical" gap={3}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <Heading level={2}>{value}</Heading>
        {delta ? (
          <Text type="supporting" color="secondary" style={deltaStyle(delta)}>
            {delta.value}
            {description ? ` ${description}` : ''}
          </Text>
        ) : description ? (
          <Text type="supporting" color="secondary">
            {description}
          </Text>
        ) : null}
      </Stack>
      {media}
    </Stack>
  );
}
