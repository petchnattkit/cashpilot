import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface RunwayWidgetProps {
  months: number;
  fixedCost: number;
  formatRunway: (months: number, fixedCost: number) => string;
}

function RunwayWidget({ months, fixedCost, formatRunway }: RunwayWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Runway</CardTitle>
        <Activity className="w-4 h-4 text-neutral-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatRunway(months, fixedCost)}</div>
        <p className="text-xs text-neutral-500 mt-1">Based on fixed cost</p>
      </CardContent>
    </Card>
  );
}

export { RunwayWidget };
