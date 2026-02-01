import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { aggregateCashFlowByPeriod } from '../../services/scoringService';
import type { TransactionForScoring } from '../../services/scoringService';
import type { CashFlowPeriod } from '../../types/metrics';

const COLORS = {
  cashIn: '#10B981', // success green
  cashOut: '#EF4444', // error red
};

interface CashFlowBarChartProps {
  transactions: TransactionForScoring[];
  height?: number;
}

type PeriodType = 'week' | 'month';

// Utility function for currency formatting
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Custom tooltip component - defined outside to avoid re-render issues
interface TooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}

const CashFlowTooltip = ({ active, payload, label }: TooltipProps): ReactNode => {
  if (active && payload && payload.length) {
    const cashInItem = payload.find((p: { dataKey: string }) => p.dataKey === 'cashIn');
    const cashOutItem = payload.find((p: { dataKey: string }) => p.dataKey === 'cashOut');
    const cashIn = cashInItem?.value || 0;
    const cashOut = cashOutItem?.value || 0;
    const net = cashIn - cashOut;

    return (
      <div className="bg-white p-3 border border-neutral-200 shadow-soft rounded-lg text-sm">
        <p className="font-semibold text-neutral-900 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COLORS.cashIn }}
            />
            <span className="text-neutral-600">Cash In:</span>
            <span className="text-success font-medium">{formatCurrency(cashIn)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COLORS.cashOut }}
            />
            <span className="text-neutral-600">Cash Out:</span>
            <span className="text-error font-medium">{formatCurrency(cashOut)}</span>
          </div>
          <div className="border-t border-neutral-200 pt-1 mt-2">
            <span className="text-neutral-600">Net: </span>
            <span className={`font-medium ${net >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(net)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CashFlowBarChart = ({
  transactions,
  height = 300,
}: CashFlowBarChartProps) => {
  const [periodType, setPeriodType] = useState<PeriodType>('month');

  const data = useMemo(() => {
    return aggregateCashFlowByPeriod(transactions, periodType);
  }, [transactions, periodType]);

  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center bg-neutral-50 rounded-lg border border-dashed border-neutral-200"
        style={{ height }}
      >
        <p className="text-neutral-500 text-sm">No cash flow data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Cash Flow Analysis</h3>
        <div className="flex bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setPeriodType('week')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              periodType === 'week'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
            aria-pressed={periodType === 'week'}
          >
            Week
          </button>
          <button
            onClick={() => setPeriodType('month')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              periodType === 'month'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
            aria-pressed={periodType === 'month'}
          >
            Month
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="period"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(value) => formatCurrency(Number(value))}
            />
            <Tooltip content={<CashFlowTooltip />} cursor={{ fill: '#e2e8f0', opacity: 0.1 }} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-neutral-600">{value}</span>}
            />
            <Bar
              name="Cash In"
              dataKey="cashIn"
              fill={COLORS.cashIn}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              name="Cash Out"
              dataKey="cashOut"
              fill={COLORS.cashOut}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export type { CashFlowPeriod };
