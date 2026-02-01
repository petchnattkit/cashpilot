import { TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TotalOutflowWidgetProps {
  value: number;
  formatCurrency: (n: number) => string;
}

function TotalOutflowWidget({ value, formatCurrency }: TotalOutflowWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Total Outflow</CardTitle>
        <TrendingDown className="w-4 h-4 text-error" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-error">{formatCurrency(value)}</div>
        <p className="text-xs text-neutral-500 mt-1">All time expenses</p>
      </CardContent>
    </Card>
  );
}

export { TotalOutflowWidget };
