import { TrendingUp, Repeat, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/card';
import { useDashboardInsights } from '../../hooks/useDashboardInsights';

interface InsightsSectionProps {
  insights: ReturnType<typeof useDashboardInsights>;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const InsightsSection = ({ insights }: InsightsSectionProps) => {
  if (!insights) return null;

  // Calculate combined top spender (suppliers + customers)
  const allEntities = [
    ...insights.topSuppliersByValue.map(s => ({ ...s, type: 'supplier' as const })),
    ...insights.topCustomersByValue.map(c => ({ ...c, type: 'customer' as const })),
  ].sort((a, b) => b.value - a.value);

  const topSpender = allEntities[0];

  // Calculate combined top frequency
  const allFreqEntities = [
    ...insights.topSuppliersByFreq.map(s => ({ ...s, type: 'supplier' as const })),
    ...insights.topCustomersByFreq.map(c => ({ ...c, type: 'customer' as const })),
  ].sort((a, b) => b.count - a.count);

  const topFrequency = allFreqEntities[0];

  // Calculate combined highest risk (pending value)
  const allRiskEntities = [
    ...insights.riskSuppliers.map(s => ({ ...s, type: 'supplier' as const })),
    ...insights.riskCustomers.map(c => ({ ...c, type: 'customer' as const })),
  ].sort((a, b) => b.pendingValue - a.pendingValue);

  const highestRisk = allRiskEntities[0];

  // Calculate total value for percentage
  const totalValue = allEntities.reduce((sum, e) => sum + e.value, 0);
  const topSpenderPercentage = topSpender && totalValue > 0
    ? Math.round((topSpender.value / totalValue) * 100)
    : 0;

  // Empty state
  if (!topSpender && !topFrequency && !highestRisk) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Top Spender Card */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Top Spender
          </span>
        </div>
        <div className="mt-4">
          {topSpender ? (
            <>
              <h4 className="text-lg font-semibold text-neutral-900 truncate" title={topSpender.name}>
                {topSpender.name}
              </h4>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatCurrency(topSpender.value)}
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                {topSpenderPercentage}% of total transactions
              </p>
            </>
          ) : (
            <p className="text-sm text-neutral-400 italic">No data available</p>
          )}
        </div>
      </Card>

      {/* Top Frequency Card */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Repeat className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Top Frequency
          </span>
        </div>
        <div className="mt-4">
          {topFrequency ? (
            <>
              <h4 className="text-lg font-semibold text-neutral-900 truncate" title={topFrequency.name}>
                {topFrequency.name}
              </h4>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {topFrequency.count} transactions
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Avg: {formatCurrency(topFrequency.value / topFrequency.count)}
              </p>
            </>
          ) : (
            <p className="text-sm text-neutral-400 italic">No data available</p>
          )}
        </div>
      </Card>

      {/* Highest Risk Card */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="p-2 bg-warning/10 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Highest Risk
          </span>
        </div>
        <div className="mt-4">
          {highestRisk ? (
            <>
              <h4 className="text-lg font-semibold text-neutral-900 truncate" title={highestRisk.name}>
                {highestRisk.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error">
                  High Risk
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                Pending: {formatCurrency(highestRisk.pendingValue)}
              </p>
            </>
          ) : (
            <p className="text-sm text-neutral-400 italic">No pending risks</p>
          )}
        </div>
      </Card>
    </div>
  );
};
