import { useMemo, useCallback } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { parseISO } from 'date-fns';
import { formatXAxisLabel } from '../../../lib/chartUtils';

// Colors from tailwind.config.js
const COLORS = {
  primary: '#0F2042',
  accent: '#D4AF37',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  neutral200: '#e2e8f0',
  neutral500: '#64748b',
};

interface BaseChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  xAxisKey: string;
  series: {
    key: string;
    color?: string;
    name?: string;
  }[];
  height?: number;
  isLoading?: boolean;
  emptyMessage?: string;
}

interface LineChartProps extends BaseChartProps {
  baseline?: number;
  showWarningArea?: boolean;
}

const ChartSkeleton = ({ height }: { height: number }) => (
  <div
    className="w-full bg-neutral-100 animate-pulse rounded-lg"
    style={{ height }}
    role="progressbar"
    aria-label="Loading chart"
  >
    <div className="h-full w-full flex items-end justify-between p-4 gap-2">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="bg-neutral-200 w-full rounded-t"
          style={{ height: `${[40, 60, 30, 80, 50, 70, 45][i % 7]}%` }}
        />
      ))}
    </div>
  </div>
);

const EmptyState = ({ height, message }: { height: number; message: string }) => (
  <div
    className="w-full flex items-center justify-center bg-neutral-50 rounded-lg border border-dashed border-neutral-200"
    style={{ height }}
  >
    <p className="text-neutral-500 text-sm">{message}</p>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-neutral-200 shadow-soft rounded-lg text-sm">
        <p className="font-semibold text-neutral-900 mb-1">{label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-neutral-600">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const LineChart = ({
  data,
  xAxisKey,
  series,
  height = 300,
  isLoading = false,
  emptyMessage = 'No data available',
  baseline,
  showWarningArea = true,
}: LineChartProps) => {
  // Hooks must be called before any early returns
  const startDate = useMemo(() => {
    return data && data.length > 0 ? parseISO(String(data[0][xAxisKey])) : new Date();
  }, [data, xAxisKey]);

  const tickInterval = useMemo(() => {
    return data && data.length > 30 ? Math.floor(data.length / 8) : 'preserveStartEnd';
  }, [data]);

  const handleTickFormat = useCallback(
    (value: string) => formatXAxisLabel(String(value), startDate),
    [startDate]
  );

  // Early returns after all hooks
  if (isLoading) return <ChartSkeleton height={height} />;
  if (!data || data.length === 0) return <EmptyState height={height} message={emptyMessage} />;

  // Calculate min Y value for warning area
  const values = data.flatMap((d) => series.map((s) => d[s.key])).filter((v) => typeof v === 'number');
  const minValue = Math.min(...values);

  // Determine if we should show the baseline
  const hasBaseline = baseline !== undefined && baseline !== null;

  // Calculate warning area boundaries
  // We want to shade from the bottom of the chart up to the baseline
  // when the balance goes below baseline
  const warningAreaMin = Math.min(minValue, hasBaseline ? baseline : minValue);
  const warningAreaMax = hasBaseline ? baseline : minValue;

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.neutral200} vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            stroke={COLORS.neutral500}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
            tickFormatter={handleTickFormat}
            interval={tickInterval}
          />
          <YAxis
            stroke={COLORS.neutral500}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: COLORS.neutral200 }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Warning area - shaded when projection is below baseline */}
          {showWarningArea && hasBaseline && (
            <ReferenceArea
              y1={warningAreaMin}
              y2={warningAreaMax}
              fill={COLORS.warning}
              fillOpacity={0.1}
              ifOverflow="extendDomain"
            />
          )}

          {/* Baseline reference line */}
          {hasBaseline && (
            <ReferenceLine
              y={baseline}
              stroke={COLORS.accent}
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: 'Baseline',
                position: 'right',
                fill: COLORS.accent,
                fontSize: 12,
              }}
            />
          )}

          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name || s.key}
              stroke={s.color || COLORS.primary}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BarChart = ({
  data,
  xAxisKey,
  series,
  height = 300,
  isLoading = false,
  emptyMessage = 'No data available',
}: BaseChartProps) => {
  if (isLoading) return <ChartSkeleton height={height} />;
  if (!data || data.length === 0) return <EmptyState height={height} message={emptyMessage} />;

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.neutral200} vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            stroke={COLORS.neutral500}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke={COLORS.neutral500}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: COLORS.neutral200, opacity: 0.1 }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name || s.key}
              fill={s.color || COLORS.primary}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
