import { Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface NetLiquidityWidgetProps {
  value: number;
  formatCurrency: (n: number) => string;
}

function NetLiquidityWidget({ value, formatCurrency }: NetLiquidityWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Net Liquidity</CardTitle>
        <Wallet className="w-4 h-4 text-neutral-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(value)}</div>
        <p className="text-xs text-neutral-500 mt-1">Cash In - Cash Out</p>
      </CardContent>
    </Card>
  );
}

export { NetLiquidityWidget };
