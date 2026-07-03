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
  // An explicit sentiment wins over the arrow direction: for inverted metrics
  // (error rate, latency) "up" is bad and "down" is good.
  const sentiment =
    delta.sentiment ??
    (delta.direction === 'up'
      ? 'positive'
      : delta.direction === 'down'
        ? 'negative'
        : 'neutral');
  if (sentiment === 'positive') {
    // --color-success is the same dark green in both schemes; --color-icon-green
    // matches it in light mode but lifts for contrast on dark surfaces.
    return {color: 'var(--color-icon-green, var(--color-success))'};
  }
  if (sentiment === 'negative') {
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
