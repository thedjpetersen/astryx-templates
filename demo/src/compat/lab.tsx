import {Children, isValidElement} from 'react';
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

interface AxisSpec {
  position: string;
  tickFormat?: (value: unknown) => string;
}

/** Flattens the declarative `axes` ReactNode into renderable axis specs. */
function collectAxes(node: ReactNode, out: AxisSpec[] = []): AxisSpec[] {
  Children.forEach(node, child => {
    if (!isValidElement(child)) {
      return;
    }
    const props = child.props as {
      position?: string;
      tickFormat?: (value: unknown) => string;
      children?: ReactNode;
    };
    if (child.type === ChartAxis) {
      out.push({position: props.position ?? 'bottom', tickFormat: props.tickFormat});
    } else if (props.children) {
      collectAxes(props.children, out);
    }
  });
  return out;
}

/** Rounds a rough interval up to a 1/2/2.5/5 × 10^k "nice" step. */
function niceStep(rough: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const frac = rough / pow;
  const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 2.5 ? 2.5 : frac <= 5 ? 5 : 10;
  return nice * pow;
}

function defaultTickFormat(value: unknown): string {
  const n = numeric(value);
  return Math.abs(n) >= 1000
    ? n.toLocaleString()
    : String(Number(n.toFixed(2)));
}

const tickLabelStyle: CSSProperties = {
  fontSize: 11,
  fontFamily: 'inherit',
  fill: 'var(--color-text-secondary)',
};

export function ChartV2<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  height = 220,
  margin = {},
  grid,
  axes,
}: ChartProps<T>) {
  const width = 640;
  const top = margin.top ?? 12;
  const right = margin.right ?? 16;
  const bottom = margin.bottom ?? 24;
  const left = margin.left ?? 32;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const values = series.flatMap(s => data.map(row => numeric(row[s.key])));
  const hasBar = series.some(s => s.kind === 'bar');
  const count = Math.max(data.length - 1, 1);

  // Nice y-domain: bars anchor to a zero baseline; line-only charts scale to
  // the data range so narrow bands (sparklines, trend lines) keep amplitude.
  let dataMin = values.length > 0 ? Math.min(...values) : 0;
  let dataMax = values.length > 0 ? Math.max(...values) : 1;
  if (hasBar) {
    dataMin = Math.min(0, dataMin);
  }
  if (dataMax === dataMin) {
    dataMax = dataMin + (Math.abs(dataMin) || 1);
  }
  const step = niceStep((dataMax - dataMin) / 4);
  const lo = Math.floor(dataMin / step) * step;
  const hi = Math.ceil(dataMax / step) * step;
  const scaleY = (value: number) =>
    top + plotHeight - ((value - lo) / (hi - lo)) * plotHeight;
  const ticks: number[] = [];
  for (let t = lo; t <= hi + step / 2; t += step) {
    ticks.push(t);
  }

  const axisSpecs = collectAxes(axes);
  const leftAxis = axisSpecs.find(a => a.position === 'left');
  const bottomAxis = axisSpecs.find(a => a.position === 'bottom');
  const formatY = leftAxis?.tickFormat ?? defaultTickFormat;
  // Thin bottom labels so dense series keep at most ~7 readable ticks.
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Chart preview">
      <rect width={width} height={height} fill="var(--color-background-card)" />
      {grid
        ? ticks
            .filter(t => t !== lo)
            .map(t => (
              <line
                key={`grid-${t}`}
                x1={left}
                x2={width - right}
                y1={scaleY(t)}
                y2={scaleY(t)}
                stroke="var(--color-border)"
              />
            ))
        : null}
      {leftAxis || bottomAxis ? (
        <line
          x1={left}
          x2={width - right}
          y1={top + plotHeight}
          y2={top + plotHeight}
          stroke="var(--color-border)"
        />
      ) : null}
      {leftAxis
        ? ticks.map(t => (
            <text
              key={`ylabel-${t}`}
              x={left - 8}
              y={scaleY(t)}
              dy="0.32em"
              textAnchor="end"
              style={tickLabelStyle}>
              {formatY(t)}
            </text>
          ))
        : null}
      {bottomAxis
        ? data.map((row, index) => {
            if (index % labelEvery !== 0) {
              return null;
            }
            const x = hasBar
              ? left + ((index + 0.5) / data.length) * plotWidth
              : left + (index / count) * plotWidth;
            const anchor = hasBar
              ? 'middle'
              : index === 0
                ? 'start'
                : index >= data.length - labelEvery
                  ? 'end'
                  : 'middle';
            const label = bottomAxis.tickFormat
              ? bottomAxis.tickFormat(row[xKey])
              : String(row[xKey]);
            return (
              <text
                key={`xlabel-${index}`}
                x={x}
                y={top + plotHeight + 16}
                textAnchor={anchor}
                style={tickLabelStyle}>
                {label}
              </text>
            );
          })
        : null}
      {series.map((s, seriesIndex) => {
        const color = s.color ?? 'var(--color-accent)';
        if (s.kind === 'bar') {
          const barWidth = Math.max(10, plotWidth / data.length - 10);
          const baseline = scaleY(Math.max(lo, 0));
          return (
            <g key={s.key}>
              {data.map((row, index) => {
                const value = numeric(row[s.key]);
                const y = scaleY(value);
                return (
                  <rect
                    key={index}
                    x={left + (index / data.length) * plotWidth + 5}
                    y={Math.min(y, baseline)}
                    width={barWidth}
                    height={Math.abs(baseline - y)}
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
            const y = scaleY(numeric(row[s.key]));
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
