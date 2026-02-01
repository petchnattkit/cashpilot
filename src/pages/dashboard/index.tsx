import { useMemo, useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { useSettings } from '../../hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Activity } from 'lucide-react';
import { SeedDataButton } from '../../components/dev/SeedDataButton';
import {
  calculateCashflowMetrics,
  generateCashflowChartData,
  generateCustomProjection,
  calculateRunway,
} from '../../services/scoringService';

import { InsightsSection, CashFlowBarChart, DateRangePicker } from '../../components/dashboard';
import { useDashboardInsights } from '../../hooks/useDashboardInsights';
import {
  NetLiquidityWidget,
  RunwayWidget,
  TotalInflowWidget,
  TotalOutflowWidget,
  ScopeSelector,
} from '../../components/dashboard';
import { CashProjection } from '../../components/dashboard/CashProjection';

// Valid scopes for chart data generation (includes 'custom')
type ChartScope = 'week' | 'month' | 'year' | 'custom';

// Chart data point with networth for internal use
interface ChartDataPointWithNetworth {
  date: string;
  balance: number;
  networth: number;
}

// Helper to get default date range (next 30 days for projections)
const getDefaultDateRange = (): { start: string; end: string } => {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 30);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

function DashboardPage() {
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { settings, isLoading: isLoadingSettings } = useSettings();
  const insights = useDashboardInsights();

  const [scope, setScope] = useState<ChartScope>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const baselineValue = settings.baseline_amount;
  const fixedCost = settings.fixed_cost;

  // Handle scope change with default dates for custom
  const handleScopeChange = (newScope: ChartScope) => {
    setScope(newScope);

    // Set default dates when switching to custom
    if (newScope === 'custom' && (!customStartDate || !customEndDate)) {
      const defaultRange = getDefaultDateRange();
      setCustomStartDate(defaultRange.start);
      setCustomEndDate(defaultRange.end);
    }
  };

  const { netLiquidity, runway, totalInflow, totalOutflow, chartData } = useMemo(() => {
    if (!transactions) {
      return {
        netLiquidity: 0,
        runway: 0,
        totalInflow: 0,
        totalOutflow: 0,
        chartData: [],
      };
    }

    // Use scoringService for calculations
    const metrics = calculateCashflowMetrics(transactions);
    const runwayMetrics = calculateRunway(metrics.netCashFlow, fixedCost);

    // Generate chart data based on scope using NEW projection functions
    let chartPoints: ChartDataPointWithNetworth[];
    if (scope === 'custom' && customStartDate && customEndDate) {
      chartPoints = generateCustomProjection(metrics.currentBalance, fixedCost, customStartDate, customEndDate);
    } else {
      // Cast scope to exclude 'custom' for the service function
      chartPoints = generateCashflowChartData(transactions, metrics.currentBalance, fixedCost, scope as 'week' | 'month' | 'year');
    }

    return {
      netLiquidity: metrics.currentBalance,
      runway: runwayMetrics.months,
      totalInflow: metrics.totalCashIn,
      totalOutflow: metrics.totalCashOut,
      chartData: chartPoints,
    };
  }, [transactions, fixedCost, scope, customStartDate, customEndDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatRunway = (months: number, fixedCostValue: number) => {
    if (fixedCostValue === 0) {
      return 'N/A';
    }
    return `${formatNumber(months)} Months`;
  };

  const isLoading = isLoadingTransactions || isLoadingSettings;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <div className="bg-neutral-100 p-4 rounded-full mb-4">
          <Activity className="w-8 h-8 text-neutral-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">No transactions yet</h2>
        <p className="text-neutral-500 max-w-sm mb-6">
          Start adding transactions to see your financial overview and cashflow projection.
        </p>
        <SeedDataButton />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Financial overview and cashflow projection.</p>
        </div>
        <SeedDataButton />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <NetLiquidityWidget value={netLiquidity} formatCurrency={formatCurrency} />

        <RunwayWidget months={runway} fixedCost={fixedCost} formatRunway={formatRunway} />

        <TotalInflowWidget value={totalInflow} formatCurrency={formatCurrency} />

        <TotalOutflowWidget value={totalOutflow} formatCurrency={formatCurrency} />
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Cashflow Projection</CardTitle>
            <ScopeSelector
              value={scope}
              onChange={handleScopeChange}
            />
          </div>
          {/* DateRangePicker shown only for custom scope */}
          {scope === 'custom' && (
            <div className="mt-4">
              <DateRangePicker
                startDate={customStartDate}
                endDate={customEndDate}
                onStartDateChange={setCustomStartDate}
                onEndDateChange={setCustomEndDate}
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <CashProjection
              chartData={chartData}
              baselineValue={baselineValue}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Bar Chart */}
      <Card>
        <CardContent className="pt-6">
          <CashFlowBarChart transactions={transactions} height={300} />
        </CardContent>
      </Card>

      {/* Insights Section */}
      <InsightsSection insights={insights} />
    </div>
  );
}

export { DashboardPage };
