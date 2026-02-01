import { LineChart } from "../../components/ui/chart/Chart";

interface ChartDataPoint {
    date: string;
    balance: number;
    networth: number;
}

function CashProjection({ chartData, baselineValue }: { chartData: ChartDataPoint[], baselineValue: number }) {
    return (
        <LineChart
            data={chartData}
            xAxisKey="date"
            series={[{ key: 'balance', name: 'Balance', color: '#1db959ff' }, { key: 'networth', name: 'Networth', color: '#115cf3ff' }]}
            height={400}
            baseline={baselineValue}
            showWarningArea={true}
        />
    );
}

export { CashProjection }