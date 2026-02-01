import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TotalInflowWidgetProps {
  value: number;
  formatCurrency: (n: number) => string;
}

function TotalInflowWidget({ value, formatCurrency }: TotalInflowWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Total Inflow</CardTitle>
        <TrendingUp className="w-4 h-4 text-success" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-success">{formatCurrency(value)}</div>
        <p className="text-xs text-neutral-500 mt-1">All time income</p>
      </CardContent>
    </Card>
  );
}

export { TotalInflowWidget };
