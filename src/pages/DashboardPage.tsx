import { useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { LineChart } from '../components/ui/Chart';
import { Wallet, TrendingUp, TrendingDown, Activity } from 'lucide-react';

function DashboardPage() {
  const { data: transactions, isLoading } = useTransactions();

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

    let totalIn = 0;
    let totalOut = 0;
    const events: { date: string; amount: number }[] = [];

    transactions.forEach((t) => {
      const cashIn = t.cash_in || 0;
      const cashOut = t.cash_out || 0;

      totalIn += cashIn;
      totalOut += cashOut;

      if (t.date_in && cashIn > 0) {
        events.push({ date: t.date_in, amount: cashIn });
      }
      if (t.date_out && cashOut > 0) {
        events.push({ date: t.date_out, amount: -cashOut });
      }
    });

    const net = totalIn - totalOut;
    const fixedExpenses = 5000; // Mocked fixed expenses
    const run = fixedExpenses > 0 ? net / fixedExpenses : 0;

    // Process chart data
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;

    // First aggregate amounts per day
    const dailyChanges = new Map<string, number>();
    events.forEach((e) => {
      const current = dailyChanges.get(e.date) || 0;
      dailyChanges.set(e.date, current + e.amount);
    });

    // Sort dates
    const sortedDates = Array.from(dailyChanges.keys()).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const data = sortedDates.map((date) => {
      const change = dailyChanges.get(date) || 0;
      runningBalance += change;
      return {
        date,
        balance: runningBalance,
      };
    });

    return {
      netLiquidity: net,
      runway: run,
      totalInflow: totalIn,
      totalOutflow: totalOut,
      chartData: data,
    };
  }, [transactions]);

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
        <p className="text-neutral-500 max-w-sm">
          Start adding transactions to see your financial overview and cashflow projection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Financial overview and cashflow projection.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Net Liquidity</CardTitle>
            <Wallet className="w-4 h-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netLiquidity)}</div>
            <p className="text-xs text-neutral-500 mt-1">Cash In - Cash Out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Runway</CardTitle>
            <Activity className="w-4 h-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(runway)} Months</div>
            <p className="text-xs text-neutral-500 mt-1">Based on fixed expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Inflow</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalInflow)}</div>
            <p className="text-xs text-neutral-500 mt-1">All time income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Outflow</CardTitle>
            <TrendingDown className="w-4 h-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">{formatCurrency(totalOutflow)}</div>
            <p className="text-xs text-neutral-500 mt-1">All time expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cashflow Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <LineChart
              data={chartData}
              xAxisKey="date"
              series={[{ key: 'balance', name: 'Balance', color: '#0F2042' }]}
              height={400}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { DashboardPage };
