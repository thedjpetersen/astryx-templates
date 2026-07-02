import type {CSSProperties, ReactNode} from 'react';

export type LogStreamLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogStreamLevel;
  source: string;
  message: string;
  detail?: ReactNode;
}

type SeriesKind = 'line' | 'bar';

interface SeriesDef {
  kind: SeriesKind;
  key: string;
  color?: string;
  label?: string;
  radius?: number;
}

interface ChartProps<T extends Record<string, unknown>> {
  data: T[];
  xKey: keyof T;
  series: SeriesDef[];
  height?: number;
  margin?: {top?: number; right?: number; bottom?: number; left?: number};
  legend?: unknown;
  tooltip?: unknown;
  grid?: ReactNode;
  axes?: ReactNode;
}

function numeric(value: unknown): number {
  return typeof value === 'number' ? value : Number(value) || 0;
}

export function line(key: string, options: Omit<SeriesDef, 'kind' | 'key'> = {}) {
  return {kind: 'line' as const, key, ...options};
}

export function bar(key: string, options: Omit<SeriesDef, 'kind' | 'key'> = {}) {
  return {kind: 'bar' as const, key, ...options};
}

export function ChartGrid(_props: {horizontal?: boolean; vertical?: boolean}) {
  return null;
}

export function ChartAxis(_props: {
  position?: 'top' | 'right' | 'bottom' | 'left' | string;
  tickFormat?: (value: unknown) => string;
}) {
  return null;
}

export function ChartV2<T extends Record<string, unknown>>({
  data,
  xKey: _xKey,
  series,
  height = 220,
  margin = {},
}: ChartProps<T>) {
  const width = 640;
  const top = margin.top ?? 12;
  const right = margin.right ?? 16;
  const bottom = margin.bottom ?? 24;
  const left = margin.left ?? 32;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const values = series.flatMap(s => data.map(row => numeric(row[s.key])));
  const max = Math.max(...values, 1);
  const count = Math.max(data.length - 1, 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Chart preview">
      <rect width={width} height={height} fill="var(--color-background-card)" />
      {[0.25, 0.5, 0.75].map(step => (
        <line
          key={step}
          x1={left}
          x2={width - right}
          y1={top + plotHeight * step}
          y2={top + plotHeight * step}
          stroke="var(--color-border)"
        />
      ))}
      {series.map((s, seriesIndex) => {
        const color = s.color ?? 'var(--color-accent)';
        if (s.kind === 'bar') {
          const barWidth = Math.max(10, plotWidth / data.length - 10);
          return (
            <g key={s.key}>
              {data.map((row, index) => {
                const value = numeric(row[s.key]);
                const barHeight = (value / max) * plotHeight;
                return (
                  <rect
                    key={index}
                    x={left + (index / data.length) * plotWidth + 5}
                    y={top + plotHeight - barHeight}
                    width={barWidth}
                    height={barHeight}
                    rx={s.radius ?? 3}
                    fill={color}
                    opacity={0.85}
                  />
                );
              })}
            </g>
          );
        }

        const points = data
          .map((row, index) => {
            const x = left + (index / count) * plotWidth;
            const y = top + plotHeight - (numeric(row[s.key]) / max) * plotHeight;
            return `${x},${y}`;
          })
          .join(' ');
        return (
          <polyline
            key={s.key}
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={seriesIndex === 0 ? 3 : 2}
          />
        );
      })}
    </svg>
  );
}

interface LogStreamProps {
  entries: LogEntry[];
  variant?: 'default' | 'terminal';
  maxHeight?: number;
  isFollowing?: boolean;
  onFollowChange?: (value: boolean) => void;
  label?: string;
}

const levelColor: Record<LogStreamLevel, string> = {
  info: 'var(--color-text-secondary)',
  warn: 'var(--color-warning)',
  error: 'var(--color-error)',
  debug: 'var(--color-text-disabled)',
};

export function LogStream({
  entries,
  variant = 'default',
  maxHeight = 420,
  label = 'Log stream',
}: LogStreamProps) {
  const terminal = variant === 'terminal';
  const style: CSSProperties = {
    maxHeight,
    overflow: 'auto',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    background: terminal ? '#0b1020' : 'var(--color-background-card)',
    color: terminal ? '#dbeafe' : 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-code)',
    fontSize: 'var(--font-size-sm)',
  };

  return (
    <div role="log" aria-label={label} style={style}>
      {entries.map(entry => (
        <div
          key={entry.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '88px 64px 140px minmax(0, 1fr)',
            gap: 'var(--spacing-2)',
            padding: 'var(--spacing-2) var(--spacing-3)',
            borderBottom: '1px solid var(--color-border)',
          }}>
          <span>{entry.timestamp}</span>
          <span style={{color: levelColor[entry.level]}}>{entry.level}</span>
          <span>{entry.source}</span>
          <span>
            {entry.message}
            {entry.detail ? <div>{entry.detail}</div> : null}
          </span>
        </div>
      ))}
    </div>
  );
}
